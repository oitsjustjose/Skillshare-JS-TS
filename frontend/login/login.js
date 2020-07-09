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
});