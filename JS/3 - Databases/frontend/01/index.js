
const renderNote = (note) => {
    const dateObj = new Date(note.postedOn);
    const prettyDate = `${dateObj.getMonth()}/${dateObj.getDate()}/${dateObj.getFullYear()}`
    const notesList = document.getElementById('notebook-thoughts');
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <b>${note.name} (${prettyDate})</b>: ${note.body}
    `;
    listItem.style.cursor = ""
    notesList.appendChild(listItem);
};

const initFormListener = () => {
    const form = document.forms[0];
    const nameInp = form.querySelector(`input[name="note-name"]`);
    const noteInp = form.querySelector(`input[name="new-entry"]`);


    form.addEventListener('submit', (evt) => {
        evt.preventDefault();
        fetch('http://localhost:3030', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                note: noteInp.value,
                name: nameInp.value
            })
        }).then((response) => {
            if (response.status === 200) {
                noteInp.placeholder = "Success!";
                noteInp.value = "";
                nameInp.value = "";
                response.json().then((asJson) => {
                    renderNote(asJson.new);
                });
            } else {
                noteInp.placeholder = "Failure!";
                noteInp.value = "";
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

