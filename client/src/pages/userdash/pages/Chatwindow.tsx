import React from 'react'

const Chatwindow = () => {
  return (
          {isChatOpen && (
        <div
          className={`fixed z-50 bottom-16 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-2xl border-[1px] border-indigo-300 w-80 h-[30rem] flex flex-col transition-transform duration-1000 ${
            isChatOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">AI Chat</h2>
            <button onClick={toggleChatWindow} className="text-red-500">
              <CircleX className="h-6 w-6 text-indigo-300 size-32" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 bg-gray-700 rounded-lg mb-2" ref={chatBox}>
            <p className="text-sm text-gray-400 mb-4 bg-gray-800 rounded-md p-2">
              Write me a story with a hero and a dragon saving the relm. keep this under 200 words.
            </p>
              <p className="mb-auto text-base p-2">
                {content}
              </p>
          </div>

          <div className="mt-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-300"
            />

            <button
              onClick={sendMessage}
              className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
  )
}

export default Chatwindow