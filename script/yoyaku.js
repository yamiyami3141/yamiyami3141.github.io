const GAS_URL = "https://script.google.com/macros/s/AKfycbzs3p4OzsTefukCQ2yh8_n_YLIgJ2gbKdVJN1jttrm0W4brco1pXr9aGrETm6MYl95S7A/exec"; // デプロイして発行されたURL

// yoyaku.html の script 部分のみ抜粋
function bookingSystem() {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzs3p4OzsTefukCQ2yh8_n_YLIgJ2gbKdVJN1jttrm0W4brco1pXr9aGrETm6MYl95S7A/exec";

    return {
        // ... (省略: step, formData などの初期値は前回と同じ) ...

        fetchSlots() {
            if (!this.formData.date) return;
            this.isLoadingSlots = true;
            this.formData.time = '';
            
            // fetch (GET) 方式に変更
            fetch(`${GAS_URL}?action=getSlots&date=${this.formData.date}`)
                .then(res => res.json())
                .then(booked => {
                    this.bookedSlots = booked;
                    this.isLoadingSlots = false;
                })
                .catch(() => this.isLoadingSlots = false);
        },

        async submitReservation() {
            if (!this.agreement) return alert("同意が必要です");
            this.isSubmitting = true;
            
            // fetch (POST) 方式に変更
            try {
                const response = await fetch(GAS_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'addUser',
                        ...this.formData
                    })
                });
                const res = await response.json();
                if (res.success) {
                    this.result = res;
                    this.step = 'success';
                } else {
                    alert(res.msg);
                }
            } catch (e) {
                alert("通信エラーが発生しました");
            } finally {
                this.isSubmitting = false;
            }
        },
        // ... (downloadTicket 等はそのまま) ...
    }
}
https://script.google.com/macros/s/AKfycbxi-QBt9SNGWMAz1bKI5LziHAoFsjK9SrY_VbM9Q6FDWWzamX4yN7XrnX3f7tWSPAvBhQ/exec