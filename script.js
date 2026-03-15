document.addEventListener('DOMContentLoaded', () => {
    // smooth scroll for anchors
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // modal utility
    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.style.display = 'flex';
    }
    function closeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.style.display = 'none';
    }

    document.querySelectorAll('.modal .close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // plan selection flow
    const planButtons = document.querySelectorAll('.select-plan');
    let selectedPlan = '';
    planButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.card');
            selectedPlan = card?.dataset?.plan || '';
            const title = document.getElementById('planModalTitle');
            if (title) title.textContent = `Enroll in ${selectedPlan}`;
            openModal('planModal');
        });
    });

    // form submission to payment modal
    const planForm = document.getElementById('planForm');
    planForm?.addEventListener('submit', e => {
        e.preventDefault();

        const formData = {
            name: planForm.elements['name']?.value || '',
            phone: planForm.elements['phone']?.value || '',
            email: planForm.elements['email']?.value || '',
            age: planForm.elements['age']?.value || '',
            startDate: planForm.elements['startDate']?.value || '',
            plan: selectedPlan,
        };

        pendingMembershipData = formData;

        closeModal('planModal');
        openModal('paymentModal');
    });

    // membership registration helpers
    let pendingMembershipData = null;

    async function sendMembershipRegistration(data) {
        try {
            await fetch('http://localhost:5000/register-membership', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        } catch (err) {
            console.error('Membership registration failed:', err);
        }
    }

    // payment options
    document.getElementById('payOnline')?.addEventListener('click', () => {
        closeModal('paymentModal');
        openModal('thankyouModal');
        if (thankTextElem) {
            thankTextElem.textContent = 'Thank you! Your payment is confirmed and you are now a member of V Shapers. Check your email for membership details.';
        }

        if (pendingMembershipData) {
            pendingMembershipData.paymentMethod = 'Pay Online';
            sendMembershipRegistration(pendingMembershipData);
            pendingMembershipData = null;
        }
    });

    document.getElementById('payGym')?.addEventListener('click', () => {
        closeModal('paymentModal');
        openModal('thankyouModal');
        if (thankTextElem) {
            thankTextElem.textContent = 'Thanks for registering! Your registration is almost complete — please visit the gym to pay and activate your membership. Check your email for next steps.';
        }

        if (pendingMembershipData) {
            pendingMembershipData.paymentMethod = 'Pay at Gym';
            sendMembershipRegistration(pendingMembershipData);
            pendingMembershipData = null;
        }
    });

    // demo booking flow
    const demoBtn = document.querySelector('.cta-buttons .btn.outline');
    const demoForm = document.getElementById('demoForm');
    const thankTextElem = document.getElementById('thankText');

    if (demoBtn) {
        demoBtn.addEventListener('click', e => {
            e.preventDefault();
            openModal('demoModal');
        });
    }

    demoForm?.addEventListener('submit', e => {
        e.preventDefault();

        const name = demoForm.elements["name"]?.value || '';
        const phone = demoForm.elements["phone"]?.value || '';
        const email = demoForm.elements["email"]?.value || '';
        const date = demoForm.elements["demoDate"]?.value || '';

        closeModal('demoModal');
        openModal('thankyouModal');
        if (thankTextElem) {
            thankTextElem.textContent = `Thank you for booking a free demo! Please check your email for confirmation, and feel free to visit our gym anytime.`;
        }

        // Send booking to backend (email delivery happens asynchronously)
        fetch("http://localhost:5000/book-demo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                phone: phone,
                email: email,
                date: date
            })
        })
        .then(res => res.json())
        .then(data => {
            // backend succeeded; nothing else needed here
        })
        .catch(err => {
            console.error(err);
            // Optionally, you could show an error / retry option here.
        });
    });

    // hide loader when page fully loads
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.transition = 'opacity 0.5s';
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }
    });
});

