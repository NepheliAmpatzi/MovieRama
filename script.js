let page = 1;
const api_key = 'bc50218d91157b1ba4f142ef7baaa6a0';
const template =
    `<div id="movie-template" class="movie-card effect">
        <img class="movie-poster" src="http://image.tmdb.org/t/p/w200{poster}" alt="Movie Poster">
        <span id="movie-title" class="movie-info">
            {title}
            <div class="date"> {date} </div>

            <div class="overview">
                {overview}
            </div>
            <a class="view-more">View more...</a>
            <input type="hidden" value="{trailer}" class="video-trailer-url"/>
        </span>
        <img class="star-icon" src="./images/Gold_Star.svg.png" alt="Flowers in Chania">
        <div class="vote-avg"> {vote_avg}/10 </div>
    </div>`;

function getNextPage() {
    fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${api_key}&page=${page}`)
        .then(res => res.json())
        .then(data => {
            data.results.forEach(parseMovie)
        })
    page++;
}

function parseMovie(movie) {
    const parentElem = document.querySelector('#movie-container');
    let movieElement = document.createElement('div');

    fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${api_key}`)
        .then(res => res.json())
        .then(video_data => {
            if (video_data.results && video_data.results.length > 0) {
                let selected_video_to_display = video_data.results[0];
                movie.youtubeVideo = selected_video_to_display;
                movieElement.innerHTML = generateMovieElement(movie);

                let movieReview = createReviewElement(movie.id);
                let reviewTitle = document.createElement('div');
                let similarMoviesTitle = document.createElement('div');
                let SimilarMovies = createSimilarMoviesElement(movie.id);

                movieElement.getElementsByClassName('view-more')[0].onclick = function () {

                    let videoTrailer = this.parentElement.getElementsByClassName('video-trailer-iframe');
                    let iframeElement = document.createElement('iframe');

                    if (videoTrailer.length === 0) {
                        iframeElement.src = `https://www.youtube.com/embed/${this.parentElement.getElementsByClassName('video-trailer-url')[0].value}`
                        iframeElement.className = "video-trailer-iframe";
                        this.innerHTML = "Show less...";

                        reviewTitle.innerHTML = "Review";
                        reviewTitle.className = "rev-title";

                        similarMoviesTitle.innerHTML = "Similar Movies";
                        similarMoviesTitle.className = "rev-title";
                        SimilarMovies.className = "similar-movies";
                        this.parentElement.append(iframeElement);
                        this.parentElement.append(reviewTitle);
                        this.parentElement.append(movieReview);
                        this.parentElement.append(similarMoviesTitle);
                        this.parentElement.append(SimilarMovies);
                    } else {
                        iframeElement = videoTrailer[0];
                        iframeElement.parentNode.removeChild(iframeElement);
                        movieReview.parentNode.removeChild(movieReview);
                        reviewTitle.parentNode.removeChild(reviewTitle);
                        similarMoviesTitle.parentNode.removeChild(similarMoviesTitle);
                        SimilarMovies.parentNode.removeChild(SimilarMovies)
                        this.innerHTML = "View more...";
                    }
                }
            }
            parentElem.append(movieElement);
        })
}


function getData(url) {
    return fetch(url)
        .then(res => res.json())
        .then(json => (json.results))
}

function createReviewElement(movieId) {
    let reviewElement = document.createElement('textarea');
    getData(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${api_key}`)
        .then(reviews => {
            if (reviews.length === 0) {
                reviewElement.innerHTML = "No reviews found."
            } else {
                reviews.forEach((rev) => {
                    reviewElement.disabled = "true";
                    reviewElement.innerHTML = rev.content;
                    reviewElement.className = "reviews"
                })
            }
        })
    return reviewElement;
}

function createSimilarMoviesElement(movieId) {
    let similarMoviesElement = document.createElement('div');
    let simMovies = [];
    getData(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${api_key}`)
        .then(similars => {
            similars.forEach(movie => simMovies.push(movie.title))
            similarMoviesElement.innerHTML = simMovies.join(', ')
        })
    return similarMoviesElement;
}

function generateMovieElement(movie) {
    getData(`https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`)
        .then(genres => {
            console.log(genres)
        })

    let result = template
        .replace('{poster}', movie.poster_path)
        .replace('{title}', movie.title)
        // .replace('{genre}', movie.genre_ids)
        .replace('{date}', movie.release_date)
        .replace('{vote_avg}', movie.vote_average)
        .replace('{overview}', movie.overview)
        .replace('{review}', movie.review)
        .replace('{similar}', movie.similarMovies)
        .replace('{trailer}', movie.youtubeVideo.key ?
            movie.youtubeVideo.key :
            `<div class="trailer-none">No trailer found</div>`)
    return result;
}



function getNextFilterPage(search) {
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${search}&include_adult=false&page=${page}`)
        .then(res => res.json())
        .then(data => data.results.forEach(parseMovie));
    page++;
}

window.onscroll = () => {
    if (document.querySelector('html').scrollHeight - (window.innerHeight + window.scrollY) < 300) {
        getNextPage();
    }
}

window.onload = () => {
    getNextPage();
    document.querySelector("#wrap >form").onsubmit = event => event.preventDefault();
    document.getElementById('search').onkeydown = event => {
        const search = event.currentTarget.value;
        page = 1;
        if (search) {
            getNextFilterPage(search)
            document.querySelector('#movie-container').innerHTML = '';

        } else {
            getNextPage();
        }
    }
}


