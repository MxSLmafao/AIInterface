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
                
                // Create image element with download functionality
                const img = document.createElement('img');
                img.src = data.url;
                img.alt = 'Generated image';
                img.className = 'img-fluid rounded';
                img.style.maxHeight = '400px';
                img.style.cursor = 'pointer'; // Add pointer cursor to indicate clickable

                // Create wrapper anchor tag for download
                const downloadLink = document.createElement('a');
                downloadLink.href = data.url;
                downloadLink.download = 'generated-image.png'; // Default filename
                downloadLink.appendChild(img);

                // Add click handler
                downloadLink.addEventListener('click', (e) => {
                    // Let the download happen naturally through the anchor tag
                    // The download attribute will trigger the download instead of navigation
                });

                generatedImageDiv.appendChild(downloadLink);
                
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
