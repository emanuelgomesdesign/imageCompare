const originalImageInput = document.getElementById('original-image');
const derivedImagesInput = document.getElementById('derived-images');
const compareButton = document.getElementById('compare-button');
const comparisonResultsDiv = document.getElementById('comparison-results');
const reportDiv = document.getElementById('report');

compareButton.addEventListener('click', async () => {
    const originalImageFile = originalImageInput.files[0];
    const derivedImageFiles = Array.from(derivedImagesInput.files);

    if (!originalImageFile || derivedImageFiles.length === 0) {
        alert("Please select an original image and at least one derived image.");
        return;
    }

    const originalImage = await loadImage(originalImageFile);

    const comparisonResults = [];
    for (const derivedImageFile of derivedImageFiles) {
      const derivedImage = await loadImage(derivedImageFile);
      const result = compareImages(originalImage, derivedImage);
      comparisonResults.push(result);
    }


    displayResults(comparisonResults);
    generateReport(comparisonResults);
});

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
    });
}

function compareImages(originalImage, derivedImage) {
  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = originalImage.width;
  originalCanvas.height = originalImage.height;
  const originalCtx = originalCanvas.getContext('2d');
  originalCtx.drawImage(originalImage, 0, 0);


  const derivedCanvas = document.createElement('canvas');
  derivedCanvas.width = derivedImage.width;
  derivedCanvas.height = derivedImage.height;
  const derivedCtx = derivedCanvas.getContext('2d');
  derivedCtx.drawImage(derivedImage, 0, 0);


  const width = Math.min(originalImage.width, derivedImage.width);
  const height = Math.min(originalImage.height, derivedImage.height);


  let diffCount = 0;
  let totalPixels = 0;

    for(let y = 0; y < height; y++){
      for (let x = 0; x < width; x++) {
          const originalPixel = originalCtx.getImageData(x, y, 1, 1).data;
          const derivedPixel = derivedCtx.getImageData(x, y, 1, 1).data;


          // Compare RGB channels (first 3 values)
          if (originalPixel[0] !== derivedPixel[0] || originalPixel[1] !== derivedPixel[1] || originalPixel[2] !== derivedPixel[2]) {
            diffCount++;
          }
        totalPixels++;
      }
    }

  return {
      originalImageCanvas: originalCanvas,
      derivedImageCanvas: derivedCanvas,
      width: width,
      height: height,
      diffPercentage: (diffCount / totalPixels) * 100,
    }
}

function displayResults(comparisonResults) {
  comparisonResultsDiv.innerHTML = ''; // Clear previous results
  comparisonResults.forEach(result => {
    const resultDiv = document.createElement('div');

    const originalLabel = document.createElement('h4');
    originalLabel.textContent = "Original Image";
    resultDiv.appendChild(originalLabel);
    resultDiv.appendChild(result.originalImageCanvas);

    const derivedLabel = document.createElement('h4');
    derivedLabel.textContent = `Derived Image - Difference: ${result.diffPercentage.toFixed(2)}%`
    resultDiv.appendChild(derivedLabel);
    resultDiv.appendChild(result.derivedImageCanvas);

      comparisonResultsDiv.appendChild(resultDiv);
  });
}
function generateReport(comparisonResults){
    let report = 'Comparison Report:\n\n';
    comparisonResults.forEach((result, index) => {
      report += `Result ${index+1}:\n`;
      report += `   Image Dimensions: ${result.width}x${result.height}\n`;
        report += `   Pixel Difference: ${result.diffPercentage.toFixed(2)}%\n`;
      report += '\n';
    });
    reportDiv.textContent = report;
}