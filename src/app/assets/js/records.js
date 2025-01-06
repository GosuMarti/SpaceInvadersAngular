document.addEventListener("DOMContentLoaded", function () {
    const apiurl = "http://wd.etsisi.upm.es:10000/records";
    fetch(apiurl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response went wrong");
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById("recordsTableBody");
            let rank = 1;

            data.slice(0, 10).forEach(record => {
                const row = document.createElement("tr");

                // Parse the record date and format it
                const recordDate = new Date(record.recordDate);
                const formattedDate = recordDate.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    // hour: '2-digit',
                    // minute: '2-digit',
                    // second: '2-digit',
                });

                row.innerHTML = `
                <td>${rank++}</td>
                <td>${record.username}</td>
                <td>${record.punctuation}</td>
                <td>${record.ufos}</td>
                <td>${record.disposedTime}</td>
                <td>${formattedDate}</td>
                `;

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("There was a problem with the fetching operation:", error);
        });
});
