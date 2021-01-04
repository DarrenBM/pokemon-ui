import { Link } from "react-router-dom";

const EvolutionList = ({ evolutions = [], className }) => {
  const evolutionsFiltered = evolutions.filter((ev) => ev && ev.num);

  return evolutionsFiltered.length ? (
    <ul className={`evolution-list list-inline d-inline-block ${className}`}>
      {evolutions
        .filter((ev) => ev && ev.num)
        .map(({ name, num }, index) => (
          <li key={`evolution-${num}`} className="list-inline-item">
            <Link to={`/${num}`}>{name || "--"}</Link>
          </li>
        ))}
    </ul>
  ) : null;
};

const Detail = ({ pokemon }) => {
  if (!pokemon) {
    return <div>Uh oh! Unable to find that pokemon!</div>;
  }

  const {
    height,
    img,
    name,
    next_evolution,
    num,
    prev_evolution,
    type: types = [],
    weaknesses = [],
    weight
  } = pokemon;

  return (
    <>
      <div className="row">
        <div className="col">
          <Link to="/" className="back">
            Back to search
          </Link>
        </div>
      </div>
      <div className="detail">
        <div className="row">
          <h1 className="name col-md-6 d-flex align-items-center">
            {img && <img src={img} alt={name} />}
            {name || "--"}
            <span className="text-muted ml-3 h2">[{num || "--"}]</span>
          </h1>
          <div className="col-md-6 d-flex align-items-center">
            {types.length && (
              <ul className="types list-unstyled h2">
                {types.map((type) => (
                  <li key={`type-${type}`} className="ml-2 badge badge-info">
                    <Link to={`/?types=${type}`} className="text-white">
                      {type}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="height">
              <span className="font-weight-bold">Height:</span> {height || "--"}
            </div>
            <div className="weight">
              <span className="font-weight-bold">Weight:</span> {weight || "--"}
            </div>
          </div>
          <div className="col-md-6 h2">
            {weaknesses.length && (
              <ul className="weaknesses d-flex list-unstyled">
                {weaknesses.map((weakness) => (
                  <li
                    key={`weakness-${weakness}`}
                    className="ml-2 badge badge-danger"
                  >
                    <Link
                      to={`/?weaknesses=${weakness}`}
                      className="text-white"
                    >
                      {weakness}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col mt-4 h3">
            <span className="sr-only">Evolution:</span>
            <h3 className="sr-only">Previous Evolutions</h3>
            <EvolutionList
              evolutions={prev_evolution}
              className="evolutions-prev"
            />
            {name}
            <h3 className="sr-only">Next Evolutions</h3>
            <EvolutionList
              evolutions={next_evolution}
              className="evolutions-next"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Detail;
