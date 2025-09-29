window.addEventListener('load', () => { // <--- THIS IS THE ONLY CHANGE

    // --- CONFIGURATION ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxGoF772h9zOM-55NkJeU5q3L72KdR_mSCEiGOYqGOvXSGYojJQ4TbPOp9bswl0Kmpa/exec";
    const RAZORPAY_KEY_ID = "rzp_live_RM7eVhUFi1PyhG";

    // --- PRICE DEFINITIONS (Remember to change to real prices before going live) ---
    const PRICE_WITHOUT_SOCIALS = 1021;    // Should be 1021
    const PRICE_WITH_SOCIALS = 1531;       // Should be 1531

    // --- ELEMENT SELECTIONS ---
    const form = document.getElementById('mun-form');
    const payButton = document.getElementById('pay-button');
    const statusMessage = document.getElementById('status-message');
    const pricingTabsContainer = document.querySelector('.pricing-tabs');
    const tabButtons = document.querySelectorAll('.pricing-tabs .tab-btn');
    const activeGlider = document.querySelector('.pricing-tabs .active-glider');
    const socialsChoiceInput = document.getElementById('socialsChoice');

    let currentPrice = PRICE_WITH_SOCIALS;

    // --- PRICE SLIDER LOGIC ---
    function updateGliderPosition(activeTab) {
        if (!activeTab || !activeGlider) return;
        activeGlider.style.width = `${activeTab.offsetWidth}px`;
        activeGlider.style.left = `${activeTab.offsetLeft}px`;
    }

    pricingTabsContainer.addEventListener('click', (e) => {
        const clickedTab = e.target.closest('.tab-btn');
        if (!clickedTab || clickedTab.classList.contains('active')) return;

        tabButtons.forEach(btn => btn.classList.remove('active'));
        clickedTab.classList.add('active');
        updateGliderPosition(clickedTab);

        currentPrice = parseInt(clickedTab.dataset.price);
        payButton.textContent = `Proceed to Pay ₹${currentPrice}`;
        
        socialsChoiceInput.value = (currentPrice === PRICE_WITH_SOCIALS) ? 'with' : 'without';
    });

    // Initialize glider position
    updateGliderPosition(document.querySelector('.pricing-tabs .tab-btn.active'));
    window.addEventListener('resize', () => updateGliderPosition(document.querySelector('.pricing-tabs .tab-btn.active')));


    // --- FORM SUBMISSION LOGIC ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        payButton.disabled = true;
        payButton.textContent = "Processing...";
        statusMessage.textContent = "Creating secure payment order...";
        statusMessage.className = "";

        try {
            const delegateName = form.name.value;
            const delegateEmail = form.email.value;
            const amountInPaise = currentPrice * 100;
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
            description: "Delegate Registration Fee",
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
        pricingTabsContainer.style.display = 'none';
        statusMessage.innerHTML = `✅ Registration Successful!<br>Your Registration ID is <strong>${registrationId}</strong>.<br>A confirmation email has been sent.`;
        statusMessage.className = 'success';
    }

    function handleFailure(errorMessage) {
        statusMessage.textContent = `❌ Error: ${errorMessage}`;
        statusMessage.className = 'error';
        payButton.disabled = false;
        payButton.textContent = `Proceed to Pay ₹${currentPrice}`;
    }
});