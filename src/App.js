import { useEffect, useState } from "react";
import "./App.scss";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";
import axios from "axios";
import Detail from "./Detail";
import Search from "./Search";

const fetchPokemon = async () => {
  const response = await axios.get(
    "https://raw.githubusercontent.com/Biuni/PokemonGO-Pokedex/master/pokedex.json"
  );
  return (response && response.data && response.data.pokemon) || [];
};

const PokemonDetail = ({ pokemon: pokemonList }) => {
  const { pokemonNum } = useParams();
  const pokemon = pokemonList.find((p) => p.num === pokemonNum);
  return <Detail pokemon={pokemon} />;
};

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchPokemon().then((items) => {
      console.log("fetched", items);
      setPokemonList(items);
      setIsLoaded(true);
    });
  }, []);

  return (
    <>
      <header className="row">
        <div className="col">Pok&#xE9;dex UI</div>
      </header>
      <main>
        {isLoaded ? (
          <Router>
            <Switch>
              <Route path="/:pokemonNum/">
                <PokemonDetail pokemon={pokemonList} />
              </Route>
              <Route path="/">
                <Search pokemon={pokemonList} />
              </Route>
            </Switch>
          </Router>
        ) : null}
      </main>
    </>
  );
}

export default App;
