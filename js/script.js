/**
 * This is the main script file for the midterm project.
 * This file contains the main logic of the project
 * @author HeliaSadat Hashemipour-9831106
 */


// html elements
const APIURL = 'https://api.github.com/users/'

const user_image = document.querySelector(".user-image");
const user_name = document.querySelector("#user-username");
const user_blog = document.querySelector("#user-blog");
const user_location = document.querySelector("#user-location");
const user_bio = document.querySelector("#user-bio");
const user_fav_lang = document.querySelector("#user-fav-lang");

const submit_button = document.getElementById("submit-button");
const loadingSpinner = document.querySelector(".loader");
const action_message = document.querySelector(".alert-message");
const actionResult = document.querySelector(".alert"); 




/**
 * Fnction that sends request to github api and get data
 * @param {*} e 
 * @returns 
 */
async function sendRequest (e) { 
  e.preventDefault(); // prevent default action
  const username = document.getElementById("value-input").value; // get input value

  if (username == "") { // if input is empty
    showAlert("Please enter a username");
    return;
  }
  // get data from local storage (bonus point)
  const data = await JSON.parse(window.localStorage.getItem(username)); 
  if (data !== null) {
    showAlert(`\"${username}\" found in LocalStorage`, 'info');
  }

  // if data is in local storage
  if (data) { 
    user_name.innerHTML = data.name ? data.name : '<span>--<span>';
    user_blog.innerHTML = data.blog ? data.blog :'<span>--<span>';
    user_bio.innerHTML = data.bio ? data.bio.replace("\n", "<br>") : '<span>--<span>';
    user_location.innerHTML = data.location ? data.location : '<span>--<span>';
    user_image.src = data.avatar_url ? data.avatar_url : '<span>--<span>';
    user_fav_lang.innerHTML = data.most_used_lang ? data.most_used_lang : '<span>--<span>';
    document.querySelector(".user-container").style.display = "block"; // show user container
    return;
  }

  // if data is not in local storage
  try { 
    show_loader(true); // show loader
    const response = await fetch(`https://api.github.com/users/${username}`); // fetch data from github api
    const data = await response.json();  // convert response to json
    // get user repos from github api
    const user_repo = await fetch(
       `https://api.github.com/users/${username}/repos?per_page=5&sort=pushed`
    ).catch((err) => {
      console.log(err);
      showAlert(err.message);
    });
    const user_repos = await user_repo?.json().catch((err) => {
      console.log(err);
      showAlert(err.message);
    });
    // Bonus point
    // get languages of user repos
    const freq_lang = []; // array to store languages
    for (let i = 0; i < user_repos.length; i++) { // loop through user repos
      const obj = user_repos[i]; // get repo
      const langs = await fetch(obj.languages_url).catch((err) => { // get languages of repo
        console.log(err);
        showAlert(err.message);
      });
      const lang = await langs.json().catch((err) => { // convert response to json
        console.log(err);
        showAlert(err.message);
      });
      freq_lang.push(lang); // add languages to array
    }

    let max = -1; // set max to -1
    let max_lang = '';   

    // get most used language
    for (let j = 0; j < freq_lang.length; j++) {
      const obj = freq_lang[j]; // get languages
      for (const key in obj) { // loop through languages
        if (obj.hasOwnProperty(key)) { // check if language is in object
          const value = obj[key]; // get value of language
          if (value > max) { // check if value is greater than max
            max = value; // set max to value
            max_lang = key; // set max_lang to key
          }
        }
      }
    }
    const most_used_lang = max_lang; // set most used language
    // if response is ok
    if (response.status == 200) { 
      data.most_used_lang = most_used_lang; // add most used language to data
      console.log(data); // log data to console
      local_storage(data); // save data to local storage

      // display data
      user_name.innerHTML = data.name ? data.name : '<span>--<span>'; 
      user_blog.innerHTML = data.blog ? data.blog : '<span>--<span>';
      user_bio.innerHTML = data.bio ? data.bio.replace("\n", "<br>") : '<span>--<span>';
      user_location.innerHTML = data.location ? data.location : '<span>--<span>';
      user_image.src = data.avatar_url ? data.avatar_url : '<span>--<span>';
      user_fav_lang.innerHTML = data.most_used_lang ? data.most_used_lang : '<span>--<span>';

      show_loader(false); // hide loader
      document.querySelector(".user-container").style.display = "block"; // show user container

    } else { // if response is not ok
      if(response.status == 404) { // if response is 404
        showAlert('No profile with this username')  // show error message
        show_loader(false); // hide loader
    }
    else
      throw new Error(data.message); // throw error (bonus point)
    }
  } catch (e) {
    console.log(e); // log error to console
    showAlert(e.message); // show error message
    show_loader(false); // hide loader
  }
};


/**
 * Function to save data to local storage
 * @param {*} data 
 */
function local_storage(data){ 
  const username = document.getElementById("value-input").value; // get username from input
// create object with data
  const res_data = { 
    name: data.name ? data.name : '<span>--<span>',
    blog: data.blog ? data.blog : '<span>--<span>',
    bio: data.bio ? data.bio.replace("\n", "<br>") : '<span>--<span>',
    location: data.location ? data.location : '<span>--<span>',
    avatar_url: data.avatar_url ? data.avatar_url : '<span>--<span>',
    most_used_lang: data.most_used_lang ? data.most_used_lang : '<span>--<span>',
  };

 // save data to local storage
  window.localStorage.setItem(username, JSON.stringify(res_data));
  document.getElementById("value-input").value = ""; // clear input
};


/**
 * Function to show error message on screen. 
 * @param {*} title 
 */
function showAlert(title){ 
  action_message.textContent = title;
  actionResult.style.display = "block"; 
  action_message.innerHTML="<span>" + title + "</span>";  
  actionResult.style.visibility = "visible"; 
  actionResult.style.transition = "opacity 0.5s ease-in-out";  
  setTimeout(() => { // removes the error message from screen after 4 seconds.
    actionResult.style.display = "none";}, 4000);
};


/**
 * Function to show loader on screen
 * @param {*} show 
 */
function show_loader(show){ 
  if (show==false) { // if show is false
    loadingSpinner.style.display = "none"; // hide loader
  } else {
    document.querySelector(".user-container").style.display = "none"; // hide user container
    loadingSpinner.style.display = "block"; // show loader
    loadingSpinner.style.transition = "opacity 0.5s ease-in-out"; 
  }
};


/**
 *  Function to check if input is valid
 * @param {*} name 
 * @returns 
 */
//
function checkValidity(name) {
  const regex1 = /[A-Za-z ]+/g;
  const regex2 = /[0-9\.\-\/]+/g;
  const foundValid = name.match(regex1);
  const foundNotValid = name.match(regex2);
  if (foundNotValid == null && foundValid.length > 0) {
      return true;
  }
  return false;
};



// add event listener to submit button
submit_button.addEventListener("click", sendRequest); 
// clear local storage
window.localStorage.clear(); 
