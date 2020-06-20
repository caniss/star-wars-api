const app = require('express')();
const axios = require('axios');
const baseURL = 'https://swapi.dev/api/';

app.use((req, res, next) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', req.header('access-control-request-headers' || '*'));
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(204).send();
    }
    next();
});

const getFilmId = (url) => {
    const id = url.split('/')[5];
    return Number(id);
}

const getPlanetId = (url) => {
    const id = url.split('/')[5];
    return Number(id);
}

const getCharacterImageUrl = (url) => {
    const getCharacterId = url.split('/')[5];
    return `https://starwars-visualguide.com/assets/img/characters/${getCharacterId}.jpg`;
}

const getFilmImageUrl = (id) => {
    return `https://starwars-visualguide.com/assets/img/films/${id}.jpg`;
}

app.get('/films', async (req, res, next) => {
    try {
        const { data: { results } } = await axios.request({ baseURL, url: 'films' });
        results.forEach(x => x.id = getFilmId(x.url));
        return res.send(results).status(200);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

app.get('/planets', async (req, res, next) => {
    try {
        const { data: { results } } = await axios.request({ baseURL, url: 'planets' });
        results.forEach(x => x.id = getPlanetId(x.url));
        return res.send(results).status(200);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

app.get('/films/:id', async (req, res, next) => {
    try {
        const filmId = req.params.id;
        const { data } = await axios.request({ baseURL, url: `films/${filmId}` });

        const charactersRequests = await Promise.all(data.characters.map(characterUrl => {
            return axios.get(characterUrl);
        }));

        const characters = charactersRequests.map((y) => y.data).map((x) => {
            return {
                name: x.name,
                gender: x.gender,
                birthYear: x.birth_year,
                eyeColor: x.eye_color,
                height: x.height,
                mass: x.mass,
                photo: getCharacterImageUrl(x.url)
            }
        });

        data.id = getFilmId(data.url);
        data.photo = getFilmImageUrl(data.id);
        data.characters = characters;

        return res.send(data).status(200);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

app.get('/planets/:id', async (req, res, next) => {
    try {
        const planetId = req.params.id;
        const { data } = await axios.request({ baseURL, url: `planets/${planetId}` });

        const filmsRequests = await Promise.all(data.films.map(filmsUrl => {
            return axios.get(filmsUrl);
        }));

        const films = filmsRequests.map((y) => y.data).map((x) => {
            return {
                title: x.title
            }
        });

        const residentsRequests = await Promise.all(data.residents.map(residentsUrl => {
            return axios.get(residentsUrl);
        }));

        const residents = residentsRequests.map((y) => y.data).map((x) => {
            return {
                name: x.name,
                photo: getCharacterImageUrl(x.url)
            }
        });

        data.id = getPlanetId(data.url);
        data.films = films;
        data.residents = residents;        

        return res.send(data).status(200);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

app.all('*', async (req, res, next) => {
    res.send({
        routes: ['films', 'films/id', 'planets', 'planets/id']
    })
})

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Aplicação Ativa :D | ${port}`);
});
