/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Link } from "react-router-dom";


const NavBar = props => {
    return(
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark justify-content-between navbar-fixed-top">
          {/* <a className="navbar-brand" href="/">Articraft</a> */}

          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            <div className="container">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                  <Link className="nav-link" to="/design/edit=new">create Design <span className="sr-only">(current)</span></Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/">create articraft</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/designs">designs</Link>
                </li>
              </ul>
            </div>
            <form className="form-inline my-2 my-lg-0">
              <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
              <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
            </form>
          </div>
      </nav>
    )
}

export default NavBar;