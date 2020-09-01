const file_types = ['image/jpeg', 'image/png'];
const available_file_size = 2 * 1024 * 1024;
const request = new XMLHttpRequest();
const fake_button = document.querySelector('#fake');
const real_button = document.querySelector('#real');
const submit_button = document.querySelector('#submitformdb');


function getLastDate() {
    let date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + "/" + month + "/" + year;
}
$(document).ready(function () {
    $('select').formSelect();
    $("#option").children().prop('disabled', true);

    $('#trainee_price').on('change', () => {
        const element = document.querySelector('#hide_content');
        if (element.classList.contains('hide'))
            element.classList.remove("hide");
        else
            element.classList.add("hide");
    })


});
$('.dropdown-trigger').dropdown();
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.datepicker');
    var instances = M.Datepicker.init(elems, { format: 'dd/mm/yyyy', autoClose: true, minDate: new Date(Date.now()) });
});
$('.carousel.carousel-slider').carousel({
    fullWidth: true,
    fullHeight: true,
    indicators: true
});
for (let k = 0; k < document.forms.length; k++)
    document.forms[k].reset();

function sub() {

    var form = $('#traineeform');
    console.log('posted')
    $.ajax({
        type: "POST",
        url: form.attr('action'),
        data: form.serialize(),
        success: function (response) {
            var elems = document.querySelectorAll('.modal');
            var instances = M.Modal.init(elems, {
                onCloseEnd: () => {
                    setTimeout(location.replace('/auth/editform'), 2000);

                }
            });
            instances[0].open();
        }
    });
}
request.onload = (req, res) => {

    if (request.status >= 200 && request.status < 400) { location.reload(); }
}
fake_button.addEventListener('click', (event) => {
    real_button.click();
});
real_button.addEventListener('change', (event) => {
    for (let i = 0; i < real_button.files.length; i++) {
        if (file_types.includes(real_button.files[i].type) == true) {
            if (real_button.files[i].size > available_file_size) {
                alert("Görselin boyutu " + available_file_size / 1024 * 1024 + " MB'den büyük olamaz.")
                return;
            }
            else {
                const file_data = new FormData(); file_data.append('avatar', real_button.files[i]);
                request.open('POST', '/auth/addimage');
                request.send(file_data);
            }
        }
        else
            alert("Bu dosya tipi desteklenmiyor. Sadece jpeg ve png.");

    }
})



