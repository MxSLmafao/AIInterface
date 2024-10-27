document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');

    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `message=${encodeURIComponent(message)}`
            });

            const data = await response.json();
            
            if (response.ok) {
                addMessage(data.response, 'ai');
            } else {
                addMessage('Sorry, something went wrong. Please try again.', 'ai');
            }
        } catch (error) {
            addMessage('Error connecting to the server. Please try again.', 'ai');
        }

        scrollToBottom();
    });

    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // Process the message content for code blocks
        const processedContent = processCodeBlocks(message);
        messageDiv.innerHTML = processedContent;
        
        chatMessages.appendChild(messageDiv);
        
        // Initialize syntax highlighting for any code blocks
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        
        // Add copy functionality to code blocks
        messageDiv.querySelectorAll('.code-block-wrapper').forEach(addCopyButton);
    }

    function processCodeBlocks(text) {
        // Replace markdown code blocks (```)
        text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
            return `<div class="code-block-wrapper">
                        <pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>
                    </div>`;
        });
        
        // Replace inline code blocks (`)
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Replace newlines with <br> tags for regular text
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function addCopyButton(wrapper) {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        
        button.addEventListener('click', async () => {
            const codeBlock = wrapper.querySelector('code');
            const text = codeBlock.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text:', err);
                button.textContent = 'Failed';
            }
        });
        
        wrapper.appendChild(button);
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
