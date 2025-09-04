import { useEffect, useState } from "react";

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("threads");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("threads", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_API",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: newMessages,
        }),
      });

      const data = await res.json();
      const reply = data.choises[0].message;
      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`mb-2 p-3 rounded-lg max-w-lg ${
              message.role === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-300 text-black mr-auto"
            }`}
          >
            {message.content}
          </div>
        ))}
        {loading && <p className="italic text-gray-500">Loading...</p>}
      </div>
      <div className="p-4 bg-white flex gap-2 border-t">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Введите запрос"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
