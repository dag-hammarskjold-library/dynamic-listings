(function () {
    const downloadBtn = document.getElementById('download-pdf');
    const content = document.getElementById('help-content');

    if (downloadBtn && content && typeof html2pdf !== 'undefined') {
        downloadBtn.addEventListener('click', async function () {
            const originalLabel = downloadBtn.innerHTML;
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF…';

            document.body.classList.add('help-pdf-export');

            try {
                await html2pdf()
                    .set({
                        margin: [12, 12, 14, 12],
                        filename: 'dynamic-listings-help.pdf',
                        image: { type: 'jpeg', quality: 0.95 },
                        html2canvas: { scale: 2, useCORS: true, logging: false },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
                    })
                    .from(content)
                    .save();
            } catch (error) {
                console.error('PDF export failed:', error);
                window.alert('Could not generate the PDF. Try Print instead, or check your network connection.');
            } finally {
                document.body.classList.remove('help-pdf-export');
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = originalLabel;
            }
        });
    }

    const printBtn = document.getElementById('print-help');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            window.print();
        });
    }
})();
