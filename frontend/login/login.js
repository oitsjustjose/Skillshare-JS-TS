let bsModal;

window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(location.search);
    bsModal = new bootstrap.Modal(document.getElementById('notification'));

    if (urlParams.has('error')) {
        document.getElementById('errTitle').innerText = 'Failed to Log In';
        document.getElementById('errBody').innerText = 'There was a server error and you were unable to log in. Sorry!';
        history.replaceState(null, '', location.href.replace('?error', ''));
        bsModal.show();
    }

    /**
     * action="http://localhost:3030/login" method="POST"
     */

    document.forms[0].addEventListener('submit', async (evt) => {
        evt.preventDefault();
        const data = new URLSearchParams();
        for (const pair of new FormData(document.forms[0])) {
            data.append(pair[0], pair[1]);
        }

        const resp = await fetch('http://localhost:3030/login', {
            method: 'POST',
            body: data
        });

        if (resp.status === 200) {
            const asJson = await resp.json();
            sessionStorage.setItem('AuthToken', asJson.token);
            location.assign('/');
        } else {
            location.assign('/login?error');
        }
    });
});