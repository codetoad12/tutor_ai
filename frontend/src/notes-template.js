// Template for handwritten-style notes
export function createNotesTemplate(title, messages) {
    // CSS for the handwritten style
    const style = `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Patrick+Hand&family=Kalam:wght@300;400;700&display=swap');
        
        body {
            font-family: 'Patrick Hand', cursive;
            background-color: #f8f4e5;
            padding: 20px;
            line-height: 1.5;
            color: #333;
        }
        
        .notes-container {
            max-width: 800px;
            margin: 0 auto;
            background-image: 
                linear-gradient(#f5f5f0 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,255,0.05) 1px, transparent 1px);
            background-size: 100% 2em, 3em 100%;
            padding: 30px 30px 30px 80px; /* Increased left padding for more space */
            position: relative;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-radius: 3px;
        }
        
        .notes-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 60px; /* Adjusted position to create more space */
            height: 100%;
            width: 2px;
            background-color: rgba(255, 0, 0, 0.3);
        }
        
        .page-title {
            font-family: 'Kalam', cursive;
            font-weight: 700;
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 30px;
            text-align: center;
            margin-left: -50px; /* Adjust title back to center despite container padding */
            text-decoration: underline;
            text-decoration-style: wavy;
            text-decoration-color: #e74c3c;
            transform: rotate(-1deg);
            text-shadow: 1px 1px 1px rgba(0,0,0,0.1);
        }
        
        .date {
            font-size: 14px;
            text-align: right;
            margin-bottom: 30px;
            margin-right: 20px; /* Added right margin */
            color: #7f8c8d;
            font-family: 'Caveat', cursive;
            transform: rotate(1deg);
        }
        
        .section-title {
            font-family: 'Kalam', cursive;
            font-weight: 700;
            font-size: 24px;
            color: #3498db;
            margin-top: 24px;
            margin-bottom: 12px;
            position: relative;
            display: inline-block;
        }
        
        .section-title::after {
            content: "";
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, #3498db, transparent);
        }
        
        .question {
            font-family: 'Kalam', cursive;
            font-size: 18px;
            color: #e74c3c;
            margin-bottom: 12px;
            padding-left: 15px; /* Reduced padding, since container already has larger padding */
            border-left: 3px solid #e74c3c;
            font-weight: 700;
            position: relative;
        }
        
        .answer {
            font-family: 'Patrick Hand', cursive;
            font-size: 16px;
            margin-bottom: 25px;
            padding-left: 15px; /* Reduced padding */
            color: #2c3e50;
            position: relative;
        }
        
        .answer::before {
            content: "✓";
            position: absolute;
            left: -5px;
            color: #27ae60;
            opacity: 0.7;
            font-weight: bold;
        }
        
        .highlight {
            background: linear-gradient(180deg, rgba(255,255,255,0) 50%, rgba(255,255,0,0.4) 50%);
            padding: 0 2px;
            display: inline-block;
            transform: rotate(-0.3deg);
        }
        
        .bullet-point {
            position: relative;
            padding-left: 20px;
            margin-bottom: 8px;
        }
        
        .bullet-point::before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3498db;
            font-size: 18px;
        }
        
        .note-box {
            border: 2px dashed #9b59b6;
            padding: 15px;
            margin: 15px 0;
            background-color: rgba(155, 89, 182, 0.1);
            border-radius: 8px;
            transform: rotate(-0.5deg);
            box-shadow: 2px 2px 4px rgba(0,0,0,0.05);
        }
        
        .study-tips {
            margin-top: 40px;
            padding: 20px;
            background-color: rgba(241, 196, 15, 0.1);
            border-radius: 8px;
            border-top: 2px solid #f1c40f;
            position: relative;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.05);
        }
        
        .study-tips::after {
            content: "❗";
            position: absolute;
            top: -15px;
            right: 20px;
            font-size: 24px;
            color: #f1c40f;
        }
        
        .divider {
            text-align: center;
            margin: 25px 0;
            font-size: 18px;
            color: #7f8c8d;
            position: relative;
        }
        
        .divider::before, .divider::after {
            content: "";
            position: absolute;
            top: 50%;
            width: 30%;
            height: 1px;
            background: #d0d0d0;
        }
        
        .divider::before {
            left: 0;
        }
        
        .divider::after {
            right: 0;
        }
        
        .page-break-hint {
            height: 20px;
            position: relative;
            margin: 20px 0;
            text-align: right;
        }
        
        .page-break-hint::after {
            content: "(continued...)";
            font-family: 'Caveat', cursive;
            font-style: italic;
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .answer-continued::before {
            content: "↪";
            position: absolute;
            left: -5px;
            color: #3498db;
            opacity: 0.7;
            font-weight: bold;
        }
    `;

    // Create the HTML content
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>${style}</style>
    </head>
    <body>
        <div class="notes-container">
            <div class="page-title">${title}</div>
            <div class="date">Date: ${new Date().toLocaleDateString()}</div>
            
            <div class="section-title">Session Overview</div>
            <div class="note-box">
                These are my notes from a UPSC tutoring session. The content covers important topics for exam preparation.
            </div>
    `;

    // Add each Q&A pair
    messages.forEach((message, index) => {
        html += `
            <div class="divider">✧✦✧</div>
            <div class="section-title">Question ${index + 1}</div>
            <div class="question">${message.content}</div>
        `;

        if (message.response) {
            // Process the response to add highlighting to important terms
            let processedResponse = message.response.response_text
                // Convert markdown to HTML - preserve formatting carefully
                .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>') // Bold text as highlights
                .replace(/\n- /g, '</p><p class="bullet-point">') // Convert markdown bullets to HTML
                .replace(/\n\n/g, '</p><p>') // Convert paragraphs
                .replace(/\n/g, '<br>'); // Convert single line breaks
                
            // Split very long responses into smaller chunks to avoid page break issues
            const maxResponseLength = 1000;
            if (processedResponse.length > maxResponseLength) {
                const chunks = [];
                let currentIndex = 0;
                
                // Find natural breakpoints (after paragraphs) to split the content
                while (currentIndex < processedResponse.length) {
                    let endIndex = currentIndex + maxResponseLength;
                    if (endIndex < processedResponse.length) {
                        // Try to find a paragraph or sentence break
                        const paragraphBreak = processedResponse.lastIndexOf('</p><p>', endIndex);
                        const sentenceBreak = processedResponse.lastIndexOf('. ', endIndex);
                        
                        if (paragraphBreak > currentIndex && paragraphBreak < endIndex) {
                            endIndex = paragraphBreak + 5; // Include the </p> tag
                        } else if (sentenceBreak > currentIndex && sentenceBreak < endIndex) {
                            endIndex = sentenceBreak + 1;
                        }
                    } else {
                        endIndex = processedResponse.length;
                    }
                    
                    chunks.push(processedResponse.substring(currentIndex, endIndex));
                    currentIndex = endIndex;
                }
                
                // Add each chunk with proper wrapping
                chunks.forEach((chunk, i) => {
                    html += `
                        <div class="answer${i > 0 ? ' answer-continued' : ''}">
                            <p>${chunk}</p>
                            ${i < chunks.length - 1 ? '<div class="page-break-hint"></div>' : ''}
                        </div>
                    `;
                });
            } else {
                html += `
                    <div class="answer"><p>${processedResponse}</p></div>
                `;
            }
        }
    });

    // Add study tips
    html += `
            <div class="study-tips">
                <div class="section-title">Study Tips</div>
                <p class="bullet-point">Review these notes regularly, at least once a week</p>
                <p class="bullet-point">Create flashcards for important facts and concepts</p>
                <p class="bullet-point">Practice writing answers to reinforce your learning</p>
                <p class="bullet-point">Connect topics across different subjects for better understanding</p>
                <p class="bullet-point">Use different colored pens when reviewing to emphasize key points</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return html;
} 