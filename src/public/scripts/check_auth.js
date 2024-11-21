async function checkAuth() {
    const response = await fetch('/api/users/profile', { credentials: 'include' });

    if (response.ok) {
        const data = await response.json();
        document.getElementById('userInfo').innerText = `Вы вошли как ${data.user.username}`;

        const userRole = data.user.role;

        const flashcardsResponse = await fetch('/api/flashcards');
        if (flashcardsResponse.ok) {
            const flashcards = await flashcardsResponse.json();
            let currentIndex = 0;

           const displayCard = (index) => {
                const cardContainer = document.getElementById('flashcardsInfo');
                cardContainer.innerHTML = '';

                const card = flashcards[index % flashcards.length];

                const listItem = document.createElement('div'); // Используем div вместо li
                listItem.className = 'card-item';

                const cardTitle = document.createElement('h4');
                cardTitle.innerText = card.word;

               const cardText = document.createElement('p');
               cardText.innerText = card.translation;

               listItem.appendChild(cardTitle);
               listItem.appendChild(cardText);

               const buttonContainer = document.createElement('div');
               buttonContainer.className = 'button-container';

               const prevButton = document.createElement('button');
               prevButton.innerText = 'Предыдущая';
               prevButton.onclick = () => {
                   currentIndex--;
                   if (currentIndex < 0) currentIndex = flashcards.length - 1;
                   displayCard(currentIndex);
               };
               buttonContainer.appendChild(prevButton);

               const nextButton = document.createElement('button');
               nextButton.innerText = 'Следующая';
               nextButton.onclick = () => {
                   currentIndex++;
                   displayCard(currentIndex);
               };
               buttonContainer.appendChild(nextButton);

               if (userRole === 'admin') {
                   const deleteButton = document.createElement('button');
                   deleteButton.innerText = 'Удалить';
                   deleteButton.onclick = async () => {
                       const confirmDelete = confirm('Вы уверены, что хотите удалить эту карточку?');
                       if (confirmDelete) {
                           try {
                               const response = await fetch(`/api/flashcards/${card._id}`, { method: 'DELETE', credentials: 'include' });
                               if (!response.ok) {
                                   throw new Error('Ошибка при удалении карточки.');
                               }
                               console.log(`Карточка с ID ${card._id} удалена.`);
                               currentIndex++;
                               displayCard(currentIndex);
                           } catch (error) {
                               console.error(error.message);
                               alert('Не удалось удалить карточку. Пожалуйста, попробуйте еще раз.');
                           }
                       }
                   };
                   buttonContainer.appendChild(deleteButton);
               }

               listItem.appendChild(buttonContainer);
               cardContainer.appendChild(listItem);
            };

            displayCard(currentIndex);
        } else {
            document.getElementById('flashcardsInfo').innerText = 'Не удалось загрузить карточки.';
        }

        document.getElementById('authLinks').style.display = 'none';

    } else {
        document.getElementById('userInfo').innerText = 'Вы не авторизованы.';
        document.getElementById('authLinks').style.display = 'block';
        document.getElementById('flashcardsInfo').innerText = '';

        const flashcardsList = document.querySelector('.card-list');
        if (flashcardsList) flashcardsList.remove();
    }
}

checkAuth();