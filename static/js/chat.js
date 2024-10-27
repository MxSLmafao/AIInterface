document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const modelSelect = document.getElementById('model-select');
    const gpt4oRemaining = document.getElementById('gpt4o-remaining');

    // Function to update remaining GPT-4O uses
    async function updateGPT4ORemainingUses() {
        try {
            const response = await fetch('/remaining-gpt4o');
            const data = await response.json();
            if (modelSelect.value === 'gpt-4o') {
                gpt4oRemaining.textContent = `${data.remaining}/5 uses remaining`;
                gpt4oRemaining.style.display = 'inline';
            } else {
                gpt4oRemaining.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching remaining uses:', error);
        }
    }

    // Update remaining uses when model is changed
    modelSelect.addEventListener('change', updateGPT4ORemainingUses);

    // Initial update of remaining uses
    updateGPT4ORemainingUses();

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
                body: `message=${encodeURIComponent(message)}&model=${encodeURIComponent(modelSelect.value)}`
            });

            const data = await response.json();
            
            if (response.ok) {
                addMessage(data.response, 'ai');
                // Update remaining uses after successful GPT-4O request
                if (modelSelect.value === 'gpt-4o') {
                    updateGPT4ORemainingUses();
                }
            } else {
                addMessage(data.error || 'Sorry, something went wrong. Please try again.', 'ai');
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
    }

    function processCodeBlocks(text) {
        let processedText = text;

        // Replace triple backtick code blocks first
        processedText = processedText.replace(/```([\w]*)?([^`]+)```/g, (match, language, code) => {
            const lang = language ? language.trim() : 'plaintext';
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            
            wrapper.innerHTML = `<pre class="code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
            addCopyButton(wrapper);
            
            return wrapper.outerHTML;
        });

        // Then handle inline code blocks (single backticks)
        processedText = processedText.replace(/`([^`]+)`/g, (match, code) => {
            return `<code class="inline-code">${escapeHtml(code.trim())}</code>`;
        });

        // Replace newlines with <br> tags for regular text
        processedText = processedText.replace(/\n/g, '<br>');
        
        return processedText;
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
        button.setAttribute('title', 'Copy to clipboard');
        
        button.addEventListener('click', async () => {
            const codeBlock = wrapper.querySelector('code');
            const text = codeBlock.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                button.textContent = 'Copied!';
                button.classList.add('copy-success');
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copy-success');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text:', err);
                button.textContent = 'Failed';
                button.classList.add('copy-failed');
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copy-failed');
                }, 2000);
            }
        });
        
        // Insert button at the beginning of the wrapper
        wrapper.insertBefore(button, wrapper.firstChild);
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
