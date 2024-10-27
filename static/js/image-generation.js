document.addEventListener('DOMContentLoaded', function() {
    const imageForm = document.getElementById('image-gen-form');
    const promptInput = document.getElementById('image-prompt');
    const remainingText = document.getElementById('remaining-generations');
    const generatedImageDiv = document.getElementById('generated-image');

    imageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const prompt = promptInput.value.trim();
        if (!prompt) return;

        const submitButton = imageForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';

        try {
            const response = await fetch('/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `prompt=${encodeURIComponent(prompt)}`
            });

            const data = await response.json();
            
            if (response.ok) {
                // Update remaining generations counter
                remainingText.textContent = `Remaining generations today: ${data.remaining}`;
                
                // Clear previous image if any
                generatedImageDiv.innerHTML = '';
                
                // Create and display new image
                const img = document.createElement('img');
                img.src = data.url;
                img.alt = 'Generated image';
                img.className = 'img-fluid rounded';
                img.style.maxHeight = '400px';
                generatedImageDiv.appendChild(img);
                
                // Clear input
                promptInput.value = '';
            } else {
                throw new Error(data.error || 'Failed to generate image');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Generate Image';
        }
    });
});
