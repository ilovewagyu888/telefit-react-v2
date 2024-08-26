import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Layout from "./layout";
import Index from "./pages";
import Bmi from "./pages/Bmi";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

export default function App() {

  return (
    <>
    <Router>
      <Layout>
          <Switch>

            <Route exact path="/">
              <Index/>
            </Route>

            <Route exact path="/bmi">
              <Bmi/>
            </Route>

            <Route exact path="/register">
              <Register/>
            </Route>

            <Route exact path="/login">
              <Login/>
            </Route>

            <Route exact path="/dashboard">
              <ProtectedRoute component={Dashboard}/>
            </Route>

          </Switch>
      </Layout>
    </Router>
    </>
  )
}
