// React
import { Component, Fragment } from "react";

// Librarys
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

// Layout
const Header = () => <h2>Header</h2>
const Footer = () => <h2>Footer</h2>

// Pages
const Home = () => <h2>programa de afiliados</h2>;
const Products = () => <h2>Página de los productos</h2>;
const Contact = () => <h2>Página de contacto</h2>;
const Contact = () => <h2>Página de contacto</h2>;
const PageNotFound = () => <h2>404</h2>

class App extends Component {
  render() {
    return (
        <Router>
          <Switch>
            <Route
              path="/404"
              component={PageNotFound}
            />

            <Page path="/" component={Home} />
            <Page path="/products" component={Products} />
            <Page path="/contact" component={Contact} />

            <Redirect to="/404" />
          </Switch>
        </Router>
    );
  }
}

export default App;

class Page extends Component {
  static defaultProps = {
    exact: true,
    sensitive: true,
  };

  render() {
    return (
      <Fragment>
        <Header />
        <Route {...this.props} exact sensitive />
        <Footer />
      </Fragment>
    );
  }
}