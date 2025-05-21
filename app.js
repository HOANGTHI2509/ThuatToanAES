// app.js

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const secretKeyInput = document.getElementById('secretKey');
    const encryptButton = document.getElementById('encryptButton');
    const decryptButton = document.getElementById('decryptButton');
    const loadingDiv = document.getElementById('loading');
    const statusP = document.getElementById('status');

    function showLoading(show) {
        loadingDiv.style.display = show ? 'block' : 'none';
    }

    function setStatus(message, isError = false) {
        statusP.textContent = message;
        statusP.style.color = isError ? 'red' : 'gray';
    }

    encryptButton.addEventListener('click', async () => {
        const file = fileInput.files[0];
        const secretKey = secretKeyInput.value;

        if (!file || !secretKey) {
            setStatus('Vui lòng chọn file và nhập khóa bí mật.', true);
            return;
        }

        showLoading(true);
        setStatus('Đang mã hóa...', false);

        try {
            const fileContent = await readFileAsText(file);
            const encryptedContent = simpleAESEncrypt(fileContent, secretKey);

            const blob = new Blob([encryptedContent], { type: 'text/plain' });
            saveAs(blob, `mahoa_${file.name}.enc`);
            setStatus('Mã hóa file thành công! File đã được tải về.', false);
        } catch (error) {
            setStatus('Lỗi khi mã hóa: ' + error.message, true);
            console.error("Encrypt error:", error);
        } finally {
            showLoading(false);
        }
    });

    decryptButton.addEventListener('click', async () => {
        const file = fileInput.files[0];
        const secretKey = secretKeyInput.value;

        if (!file || !secretKey) {
            setStatus('Vui lòng chọn file và nhập khóa bí mật.', true);
            return;
        }

        showLoading(true);
        setStatus('Đang giải mã...', false);

        try {
            const fileContent = await readFileAsText(file);
            const decryptedContent = simpleAESDecrypt(fileContent, secretKey);

            // Nếu giải mã thành công (không ném lỗi từ aes-utils.js), mới tiến hành lưu file
            const blob = new Blob([decryptedContent], { type: 'text/plain' });
            saveAs(blob, `giai-ma_${file.name.replace('.enc', '')}`);
            setStatus('Giải mã file thành công! File đã được tải về.', false);
            // Sau khi thành công, có thể xóa mật khẩu để tăng cường bảo mật
            secretKeyInput.value = '';

        } catch (error) {
            // Kiểm tra lỗi cụ thể từ aes-utils.js
            if (error.message.includes('Mật khẩu sai')) {
                setStatus('Mật khẩu sai. Vui lòng nhập lại mật khẩu chính xác.', true);
                // Giữ nguyên mật khẩu đã nhập để người dùng sửa hoặc xóa
            } else if (error.message.includes('File không phải là file được mã hóa')) {
                setStatus('File được chọn không hợp lệ hoặc đã bị hỏng.', true);
            }
            else {
                setStatus('Lỗi khi giải mã: ' + error.message, true);
            }
            console.error("Decrypt error:", error);
        } finally {
            showLoading(false);
        }
    });

    /**
     * Đọc nội dung file dưới dạng văn bản.
     * @param {File} file - Đối tượng File.
     * @returns {Promise<string>} Nội dung file.
     */
    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Không thể đọc file: ' + e.target.error.message));
            reader.readAsText(file);
        });
    }
});