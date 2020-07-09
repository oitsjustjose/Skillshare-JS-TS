
const renderNote = (note) => {
    const dateObj = new Date(note.postedOn);
    const prettyDate = `${dateObj.getMonth()}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
    const notesList = document.getElementById('notebook-thoughts');
    const noteObj = document.createElement('p');
    noteObj.style.display = '-webkit-box';

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-sm';
    delBtn.innerHTML = `<i class="fas fa-eraser"></i>`;
    delBtn.addEventListener('click', (_) => {
        if (confirm(`Do You Want To Delete Your Post ${note.name}?`)) {
            fetch('http://localhost:3030', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _id: note._id
                })
            }).then((response) => {
                if (response.status === 200) {
                    notesList.removeChild(noteObj);
                } else {
                    response.json().then((err) => {
                        alert(err);
                    });
                }
            });
        }
    });


    const noteInnards = document.createElement('div');
    noteInnards.className = 'ml-2';
    noteInnards.innerHTML = `<b>${note.name} (${prettyDate})</b>: ${note.body}`;

    noteObj.appendChild(delBtn);
    noteObj.appendChild(noteInnards);

    notesList.appendChild(noteObj);
};

const initFormListener = () => {
    const form = document.forms[0];
    const nameInp = form.querySelector(`input[name = "note-name"]`);
    const noteInp = form.querySelector(`input[name = "new-entry"]`);


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
;
