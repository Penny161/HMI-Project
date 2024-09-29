async function drawWaveform(audioElement, canvasElement) {
    const canvas = canvasElement;
    const ctx = canvas.getContext('2d');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioElement);
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const response = await fetch(audioElement.src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const waveformData = new Uint8Array(canvas.width);
    const step = Math.ceil(channelData.length / canvas.width);

    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 2048;

    const bufferLength = analyser.fftSize; 
    const dataArray = new Uint8Array(bufferLength);


    // Generate waveform data
    for (let i = 0; i < canvas.width; i++) {
        const min = Math.min(...channelData.subarray(i * step, (i + 1) * step));
        const max = Math.max(...channelData.subarray(i * step, (i + 1) * step));
        waveformData[i] = Math.floor(((max - min) / 2 + min + 1) * 127.5);
    }

    // Function to draw the waveform
    function draw() {
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.beginPath();

        const sliceWidth = canvas.width / waveformData.length;
        let x = 0;
        const yScalingFactor = 0.5;

        for (let i = 0; i < waveformData.length; i++) {
            const y = (1 - waveformData[i] / 255) * canvas.height * yScalingFactor;
            ctx.lineTo(x, y);
            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Draw the current time indicator
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration || 1;
        const progressIndicatorX = (currentTime / duration) * canvas.width;
        ctx.fillStyle = 'rgba(0, 128, 255, 0.5)';
        ctx.fillRect(progressIndicatorX - 2, 0, 4, canvas.height);

        // Draw green icon at the top of the progress indicator
        ctx.fillStyle = 'green';
        ctx.fillRect(progressIndicatorX - 6, 0, 12, 12);

        // Update current level indicator
        document.getElementById('currentLevel').innerText = `Current Level: ${(audioElement.volume * 100).toFixed(0)}%`;

        requestAnimationFrame(draw);
    }

    draw(); // Draw the waveform// Generate waveform data
    for (let i = 0; i < canvas.width; i++) {
        const min = Math.min(...channelData.subarray(i * step, (i + 1) * step));
        const max = Math.max(...channelData.subarray(i * step, (i + 1) * step));
        waveformData[i] = Math.floor(((max - min) / 2 + min + 1) * 127.5);
    }

    // Function to draw the waveform
    function draw() {
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.beginPath();

        const sliceWidth = canvas.width / waveformData.length;
        let x = 0;
        const yScalingFactor = 0.5;

        for (let i = 0; i < waveformData.length; i++) {
            const y = (1 - waveformData[i] / 255) * canvas.height * yScalingFactor;
            ctx.lineTo(x, y);
            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Draw the current time indicator
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration || 1;
        const progressIndicatorX = (currentTime / duration) * canvas.width;
        ctx.fillStyle = 'rgba(0, 128, 255, 0.5)';
        ctx.fillRect(progressIndicatorX - 2, 0, 4, canvas.height);

        // Draw green icon at the top of the progress indicator
        ctx.fillStyle = 'green';
        ctx.fillRect(progressIndicatorX - 6, 0, 12, 12);

        // Update current level indicator
        document.getElementById('currentLevel').innerText = `Current Level: ${(audioElement.volume * 100).toFixed(0)}%`;

        requestAnimationFrame(draw);
    }

    draw(); // Draw the waveform

    /*function draw() {
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0; 
            const y = (v * canvas.height) / 2; 
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    } */

    audioElement.addEventListener('play', () => {
        audioContext.resume().then(() => {
            draw();
        });
    });

    return audioElement;
}

document.querySelectorAll('.track-controls').forEach(track => {
    const audioElement = track.querySelector('audio');
    const canvasElement = track.querySelector('canvas');

    drawWaveform(audioElement, canvasElement);

    track.querySelector('.play').addEventListener('click', () => {
        audioElement.play();
    });
    
    track.querySelector('.pause').addEventListener('click', () => {
        audioElement.pause();
    });

    track.querySelector('.stop').addEventListener('click', () => {
        audioElement.pause();
        audioElement.currentTime = 0;
    });

    track.querySelector('.volume').addEventListener('input', (event) => {
        audioElement.volume = event.target.value / 100;
    });
});

const progressBar = document.getElementById('progressBar');
document.querySelectorAll('audio').forEach(audioElement => {
    audioElement.addEventListener('timeupdate', () => {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.value = progress;
        document.getElementById('currentTime').innerText = formatTime(audioElement.currentTime);
        document.getElementById('totalTime').innerText = formatTime(audioElement.duration);
    });

    progressBar.addEventListener('input', () => {
        audioElement.currentTime = (progressBar.value / 100) * audioElement.duration;
    });
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
