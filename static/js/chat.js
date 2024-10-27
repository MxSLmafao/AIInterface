document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const modelSelect = document.getElementById('model-select');

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
        
        // Process the message content for formatting
        const processedContent = processFormatting(message);
        messageDiv.innerHTML = processedContent;
        
        chatMessages.appendChild(messageDiv);
        
        // Initialize syntax highlighting for code blocks
        messageDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Typeset any math content
        if (window.MathJax) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, messageDiv]);
        }
    }

    function processFormatting(text) {
        let processedText = text;

        // Handle code blocks first (to prevent interference with other formatting)
        processedText = processCodeBlocks(processedText);

        // Handle LaTeX display math expressions
        processedText = processedText.replace(/\$\$(.*?)\$\$/g, (match, expr) => {
            return `<div class="math-display">\\[${expr}\\]</div>`;
        });
        processedText = processedText.replace(/\\\[(.*?)\\\]/g, (match, expr) => {
            return `<div class="math-display">\\[${expr}\\]</div>`;
        });

        // Handle LaTeX inline math expressions
        processedText = processedText.replace(/\$([^$]+)\$/g, (match, expr) => {
            return `<span class="math-inline">\\(${expr}\\)</span>`;
        });
        processedText = processedText.replace(/\\\((.*?)\\\)/g, (match, expr) => {
            return `<span class="math-inline">\\(${expr}\\)</span>`;
        });

        // Handle Markdown formatting
        // Bold text
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text
        processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Links with target="_blank"
        processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // Replace newlines with <br> tags for regular text
        processedText = processedText.replace(/\n/g, '<br>');
        
        return processedText;
    }

    function processCodeBlocks(text) {
        let processedText = text;

        // Replace triple backtick code blocks
        processedText = processedText.replace(/```([\w]*)?([^`]+)```/g, (match, language, code) => {
            const lang = language ? language.trim() : 'plaintext';
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            
            wrapper.innerHTML = `<pre class="code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
            addCopyButton(wrapper);
            
            return wrapper.outerHTML;
        });

        // Handle inline code blocks (single backticks)
        processedText = processedText.replace(/`([^`]+)`/g, (match, code) => {
            return `<code class="inline-code">${escapeHtml(code.trim())}</code>`;
        });

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
        
        wrapper.insertBefore(button, wrapper.firstChild);
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
