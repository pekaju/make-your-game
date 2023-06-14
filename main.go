package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sort"
	"strconv"
	"text/template"

	"github.com/gorilla/websocket"
)

const PORT = "8080"

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Scores struct {
	Scores []Data
}

type Data struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  int    `json:"time"`
}

type Message struct {
	Result  string `json:"result"`
	Message string `json:"message"`
}

func MainHandler(w http.ResponseWriter, r *http.Request) {
	err := render(w, r, "templates/index.html")
	if err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// upgrade this connection to a WebSocket
	// connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}
	// listen indefinitely for new messages coming
	// through on our WebSocket connection
	reader(ws)
}

func ScoreboardHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		if r.URL.Path != "/scores" {
			http.NotFound(w, r)
			fmt.Println("Wrong path")
			return
		}
		w.Header().Set("Content-Type", "application/json")
		jsonResp, err := json.Marshal(readScores())
		if err != nil {
			http.Error(w, "server error", http.StatusInternalServerError)
			log.Fatalf("Error happened in JSON marshal. Err: %s", err)
		}
		w.WriteHeader(200)
		w.Write(jsonResp)
		return
	} else if r.Method == "POST" {
		if r.URL.Path != "/scores" {
			http.NotFound(w, r)
			fmt.Println("Wrong path")
			return
		}
		resp := make(map[string]string)
		var data Data
		err := json.NewDecoder(r.Body).Decode(&data)
		if err != nil {
			resp["result"] = "error"
			resp["message"] = "Bad data format"
			w.WriteHeader(400)
			jsonResp, err := json.Marshal(resp)
			if err != nil {
				log.Fatalf("Error happened in JSON marshal. Err: %s", err)
			}
			w.Write(jsonResp)
			return
		}
		scores := readScores()
		scores.Scores = append(scores.Scores, data)
		file, _ := json.MarshalIndent(scores.Scores, "", " ")
		err = ioutil.WriteFile("static/data/scoreboard.json", file, 0644)
		if err != nil {
			resp["result"] = "error"
			w.WriteHeader(500)
			jsonResp, err := json.Marshal(resp)
			if err != nil {
				log.Fatalf("Error happened in JSON marshal. Err: %s", err)
			}
			w.Write(jsonResp)
			return
		}
		resp["result"] = "success"
		resp["message"] = calculatePercentile(data.Score)
		w.WriteHeader(201)
		jsonResp, err := json.Marshal(resp)
		if err != nil {
			log.Fatalf("Error happened in JSON marshal. Err: %s", err)
		}
		w.Write(jsonResp)
	}
}

func main() {
	http.HandleFunc("/", MainHandler)
	http.HandleFunc("/ws", wsHandler)
	http.HandleFunc("/scores", ScoreboardHandler)
	http.Handle("/static/", http.StripPrefix("/static", http.FileServer(http.Dir("static"))))
	fmt.Printf("Starting server at port %v - click to open > http://localhost:%v\n", PORT, PORT)
	if err := http.ListenAndServe(":"+PORT, nil); err != nil {
		log.Fatal(err)
	}
}

func render(w http.ResponseWriter, req *http.Request, tmplName string) error {
	tmpl, err := template.ParseFiles(tmplName)
	if err != nil {
		return err
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		return err
	}
	return nil
}

func reader(conn *websocket.Conn) {
	for {
		var data Data
		err := conn.ReadJSON(&data)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				fmt.Println("IsUnexpectedCloseError()", err)
			}
			break
		}
		postBody, _ := json.Marshal(data)
		responseBody := bytes.NewBuffer(postBody)
		//Leverage Go's HTTP Post function to make request
		resp, err := http.Post("http://localhost:"+PORT+"/scores", "application/json", responseBody)
		//Handle Error
		if err != nil {
			log.Fatalf("An Error Occured %v", err)
		}
		defer resp.Body.Close()
		//Read the response body
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatalln(err)
		}

		// save response to Message struct
		var message Message
		err = json.Unmarshal(body, &message)
		if err != nil {
			log.Println(err)
		}

		// send message to client
		err = conn.WriteMessage(1, []byte(message.Message))
		if err != nil {
			log.Println(err)
		}
	}
}

func readScores() Scores {
	var data []map[string]interface{}
	var scores Scores
	file, err := ioutil.ReadFile("static/data/scoreboard.json")
	if err != nil {
		log.Fatal(err)
	}
	if len(file) == 0 {
		return scores
	}
	err = json.Unmarshal(file, &data)
	if err != nil {
		log.Fatal(err)
	}
	for _, v := range data {
		elem := Data{}
		dbByte, _ := json.Marshal(v)
		_ = json.Unmarshal(dbByte, &elem)

		scores.Scores = append(scores.Scores, elem)
	}
	// sort data
	sort.Slice(scores.Scores, func(i, j int) bool {
		return scores.Scores[j].Score < scores.Scores[i].Score
	})
	return scores
}

func calculatePercentile(score int) string {
	scores := readScores().Scores
	totalScores := len(scores)
	var scorePos int
	for i, v := range scores {
		if v.Score < score {
			scorePos = i
			break
		}
	}
	result := (float32(totalScores) - (float32(totalScores) - float32(scorePos))) / float32(totalScores) * float32(100)
	text := "Congrats, you are in top " + strconv.Itoa(int(result)) + "%"
	return text
}
