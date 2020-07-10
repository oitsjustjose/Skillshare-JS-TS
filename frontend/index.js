
const renderNote = (note) => {
    const dateObj = new Date(note.postedOn);
    const prettyDate = `${dateObj.getMonth()}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
    const notesList = document.getElementById('notebook-thoughts');
    const noteObj = document.createElement('p');
    noteObj.style.display = '-webkit-box';

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-sm';
    delBtn.innerHTML = `<i class="fas fa-eraser"></i>`;
    delBtn.addEventListener('click', async () => {
        if (confirm(`Do You Want To Delete Your Post ${note.name}?`)) {
            const resp = await fetch('http://localhost:3030', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': sessionStorage.getItem('AuthToken')
                },
                body: JSON.stringify({
                    _id: note._id
                })
            });

            if (resp.status === 200) {
                notesList.removeChild(noteObj);
            } else {
                const err = await resp.json();
                alert(err);
            }
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


    form.addEventListener('submit', async (evt) => {
        evt.preventDefault();

        const resp = await fetch('http://localhost:3030', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'authorization': sessionStorage.getItem('AuthToken')
            },
            body: JSON.stringify({
                note: noteInp.value,
                name: nameInp.value
            })
        });

        if (resp.status === 200) {
            noteInp.placeholder = "Success!";
            noteInp.value = "";
            nameInp.value = "";
            resp.json().then((asJson) => {
                renderNote(asJson.new);
            });
        } else {
            noteInp.placeholder = "Failure!";
            noteInp.value = "";
            nameInp.value = "";
        }
    });
};

const initLogInOutBtn = () => {
    const loggedIn = sessionStorage.getItem('AuthToken');

    const navItem = document.getElementById('nav-item');
    const navLink = document.createElement('a');
    navLink.href = loggedIn ? '/' : '/login';
    navLink.className = 'nav-link';

    if (loggedIn) {
        navItem.addEventListener('click', async (evt) => {
            evt.preventDefault();

            const resp = await fetch('http://localhost:3030/logout', {
                method: 'POST',
                body: JSON.stringify({
                    AuthToken: sessionStorage.getItem('authToken')
                })
            });

            if (resp.status === 200) {
                sessionStorage.clear();
                location.assign(navLink.href);
            } else {
                const asJson = await resp.json();
                alert(`Server Error: ${asJson.error}`);
            }
        });
    }

    navLink.innerHTML = loggedIn ?
        `<span><i class="fas fa-sign-out-alt"></i>&nbsp; Log Out</span>` :
        `<span><i class="fas fa-sign-in-alt"></i>&nbsp; Log In</span>`;

    navItem.appendChild(navLink);
};

window.addEventListener('load', async () => {
    initFormListener();

    /* Load the notes from our server! */
    const resp = await fetch('http://localhost:3030/', {
        method: 'POST',
        headers: {
            'authorization': sessionStorage.getItem('AuthToken')
        }
    });

    if (resp.status === 200) {
        const asJson = await resp.json();
        asJson.forEach((note) => {
            if (note) {
                renderNote(note);
            }
        });
    } else {
        const notesList = document.getElementById('notebook-thoughts');
        const notice = document.createElement('h3');
        notice.className = 'd-block m-auto text-center';
        notice.style.color = 'var(--bs-info)';
        notice.innerText = 'Please Log In To See Your Notes';
        notesList.appendChild(notice);

        document.getElementById('make-note').style.display = 'none';
        sessionStorage.clear();
    }
    initLogInOutBtn();
});
