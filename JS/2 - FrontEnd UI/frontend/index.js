
const renderNote = (note) => {
    const notesList = document.getElementById('notebook-thoughts');
    const listItem = document.createElement('li');
    listItem.innerText = note;
    notesList.appendChild(listItem);
};

const initFormListener = () => {
    const form = document.forms[0];
    const inputBox = form.querySelector(`input[name="new-entry"]`);


    form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        fetch('http://localhost:3030', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                note: inputBox.value
            })
        }).then((response) => {
            if (response.status === 200) {
                inputBox.placeholder = "Success!";
                inputBox.value = "";
                response.json().then((asJson) => {
                    renderNote(asJson.new);
                });
            } else {
                inputBox.placeholder = "Failure!";
                inputBox.value = "";
            }
        });
    });
};

window.addEventListener('load', () => {
    initFormListener();
    /* Load the notes from our server! */
    fetch('http://localhost:3030', {
        method: 'post'
    }).then((response) => {
        response.json().then((asJson) => {
            asJson.forEach((note) => {
                renderNote(note);
            });
        });
    });
});

