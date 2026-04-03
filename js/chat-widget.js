// Art Depot District — AI Chat Widget
// Matches mockup: navy header, avatar, "Ask the Art Depot Assistant"

(function() {
  const CHAT_FUNCTION_URL = 'https://us-central1-artdepotdistrict.cloudfunctions.net/chat';

  const WIDGET_HTML = `
    <button class="chat-trigger" id="chatTrigger" aria-label="Ask about the district">🏛️</button>
    <div class="chat-window" id="chatWindow">
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="chat-header-avatar">🏛️</div>
          <div class="chat-header-info">
            <h4>Ask the Art Depot Assistant</h4>
            <p>Businesses, events, Depot Days &amp; more</p>
          </div>
        </div>
        <button class="chat-close" id="chatClose" aria-label="Close">&times;</button>
      </div>
      <div class="chat-messages" id="chatMessages">
        <div class="chat-msg chat-msg-bot">
          Hi there! How can I assist you today? Ask me about our businesses, upcoming events, Depot Days, or the car show.
        </div>
      </div>
      <div class="chat-input-wrap">
        <input class="chat-input" id="chatInput" type="text" placeholder="Type your question..." maxlength="300">
        <button class="chat-send" id="chatSend" aria-label="Send">&#x27A4;</button>
      </div>
    </div>`;

  function initChat() {
    const placeholder = document.getElementById('chat-placeholder');
    if (!placeholder) return;
    placeholder.innerHTML = WIDGET_HTML;

    const trigger  = document.getElementById('chatTrigger');
    const win      = document.getElementById('chatWindow');
    const closeBtn = document.getElementById('chatClose');
    const input    = document.getElementById('chatInput');
    const sendBtn  = document.getElementById('chatSend');
    const messages = document.getElementById('chatMessages');

    let isOpen = false;
    let history = [];

    trigger.addEventListener('click', () => {
      isOpen = !isOpen;
      win.classList.toggle('open', isOpen);
      if (isOpen) setTimeout(() => input.focus(), 100);
    });
    closeBtn.addEventListener('click', () => { isOpen = false; win.classList.remove('open'); });

    function appendMsg(text, role) {
      const div = document.createElement('div');
      div.className = `chat-msg chat-msg-${role === 'user' ? 'user' : 'bot'}`;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
      const div = document.createElement('div');
      div.className = 'chat-typing'; div.id = 'typingIndicator';
      div.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
      const el = document.getElementById('typingIndicator');
      if (el) el.remove();
    }

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      sendBtn.disabled = true;
      input.disabled   = true;

      appendMsg(text, 'user');
      history.push({ role: 'user', content: text });
      showTyping();

      try {
        const resp = await fetch(CHAT_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });
        const data  = await resp.json();
        removeTyping();
        const reply = data.reply || "Sorry, I couldn't connect right now. Please try again.";
        appendMsg(reply, 'bot');
        history.push({ role: 'assistant', content: reply });
        if (history.length > 20) history = history.slice(-20);
      } catch(e) {
        removeTyping();
        appendMsg("I'm having trouble connecting. Please try again in a moment.", 'bot');
      }

      sendBtn.disabled = false;
      input.disabled   = false;
      input.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
})();
