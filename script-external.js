document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyx6CNV6sFskICrg5rfE9DSakJz5FrikZ3WiZy8uVYtOqi3n-BB__csWkrPmgYmG_57bw/exec";
    const RAZORPAY_KEY_ID = "rzp_live_RM7eVhUFi1PyhG";

    // --- UPDATED FIXED PRICE ---
    const REGISTRATION_PRICE = 1837;

    // --- ELEMENT SELECTIONS ---
    const form = document.getElementById('mun-form');
    const payButton = document.getElementById('pay-button');
    const statusMessage = document.getElementById('status-message');

    // --- FORM SUBMISSION LOGIC (No changes needed here) ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        payButton.disabled = true;
        payButton.textContent = "Processing...";
        statusMessage.textContent = "Creating secure payment order...";
        statusMessage.className = "";

        try {
            const delegateName = form.name.value;
            const delegateEmail = form.email.value;
            const amountInPaise = REGISTRATION_PRICE * 100;
            const orderUrl = `${SCRIPT_URL}?action=create_order&name=${encodeURIComponent(delegateName)}&email=${encodeURIComponent(delegateEmail)}&amount=${amountInPaise}`;
            
            const orderResponse = await fetch(orderUrl);
            const orderData = await orderResponse.json();

            if (!orderData.success) {
                throw new Error(orderData.message || "Could not create order.");
            }
            
            openRazorpayCheckout(orderData.order);
        } catch (error) {
            handleFailure(error.message);
        }
    });

    function openRazorpayCheckout(order) {
        statusMessage.textContent = "Redirecting to payment gateway...";
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "VJ MUN 2025",
            description: "External Delegate Registration Fee",
            order_id: order.id,
            handler: function (response) {
                payButton.textContent = "Verifying & Saving...";
                statusMessage.textContent = "Payment successful! Saving your registration...";
                
                const formData = new FormData(form);
                formData.append('paymentId', response.razorpay_payment_id);
                formData.append('paymentAmount', order.amount / 100);

                fetch(SCRIPT_URL, { method: 'POST', body: formData })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        handleSuccess(data.registrationId);
                    } else {
                        handleFailure(data.message || "Failed to save registration.");
                    }
                })
                .catch(error => handleFailure("Error saving data. Please contact support."));
            },
            prefill: {
                name: form.name.value,
                email: form.email.value,
                contact: form.contactNumber.value
            },
            theme: { color: "#6a0dad" },
            modal: {
                ondismiss: function() {
                    handleFailure("Payment was cancelled.");
                }
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
    }

    function handleSuccess(registrationId) {
        form.style.display = 'none';
        const priceDisplay = document.querySelector('.price-display');
        if(priceDisplay) priceDisplay.style.display = 'none';
        
        statusMessage.innerHTML = `✅ Registration Successful!<br>Your Registration ID is <strong>${registrationId}</strong>.<br>A confirmation email has been sent.`;
        statusMessage.className = 'success';
    }

    function handleFailure(errorMessage) {
        statusMessage.textContent = `❌ Error: ${errorMessage}`;
        statusMessage.className = 'error';
        payButton.disabled = false;
        payButton.textContent = `Proceed to Pay ₹${REGISTRATION_PRICE}`;
    }
});