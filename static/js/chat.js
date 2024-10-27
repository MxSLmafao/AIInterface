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
        console.log('Processing message:', message);
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // Process the message content for code blocks
        const processedContent = processCodeBlocks(message);
        console.log('Processed content:', processedContent);
        messageDiv.innerHTML = processedContent;
        
        chatMessages.appendChild(messageDiv);
        
        // Initialize syntax highlighting for any code blocks
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            console.log('Applying syntax highlighting to:', block.textContent);
            hljs.highlightElement(block);
        });
        
        // Add copy functionality to code blocks
        messageDiv.querySelectorAll('.code-block-wrapper').forEach(addCopyButton);
    }

    function processCodeBlocks(text) {
        console.log('Original text:', text);
        let processedText = text;

        // Replace triple backtick code blocks first
        processedText = processedText.replace(/```([\w]*)?([^`]+)```/g, (match, language, code) => {
            console.log('Found code block:', { language, code });
            const lang = language ? language.trim() : 'plaintext';
            return `<div class="code-block-wrapper">
                        <pre class="code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>
                    </div>`;
        });

        // Then handle inline code blocks (single backticks)
        processedText = processedText.replace(/`([^`]+)`/g, (match, code) => {
            console.log('Found inline code:', code);
            return `<code class="inline-code">${escapeHtml(code.trim())}</code>`;
        });

        // Replace newlines with <br> tags for regular text
        processedText = processedText.replace(/\n/g, '<br>');
        
        console.log('Final processed text:', processedText);
        return processedText;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function addCopyButton(wrapper) {
        console.log('Adding copy button to wrapper:', wrapper);
        // Remove any existing copy button first
        const existingButton = wrapper.querySelector('.copy-button');
        if (existingButton) {
            existingButton.remove();
        }

        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        button.setAttribute('title', 'Copy to clipboard');
        
        button.addEventListener('click', async () => {
            const codeBlock = wrapper.querySelector('code');
            const text = codeBlock.textContent;
            console.log('Copying text:', text);
            
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
        
        wrapper.appendChild(button);
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
