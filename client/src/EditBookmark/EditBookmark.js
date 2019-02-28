import React, { Component } from "react";
import BookmarksContext from "../BookmarksContext";
import config from "../config";

class EditBookmark extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      id: '',
      title: '',
      url: '',
      description: '',
      rating: 1,
    }
  }

  static contextType = BookmarksContext;

  handleChangeTitle = e => { this.setState({title: e.target.value}) }
  handleChangeUrl = e => { this.setState({url: e.target.value}) }
  handleChangeDescription = e => { this.setState({description: e.target.value}) }
  handleChangeRating = e => { this.setState({rating: e.target.value}) }
  handleChangeCancel = () => { this.props.history.push('/') }

  componentDidMount() {
    const { bookmarkId } = this.props.match.params;

    fetch(`${config.API_ENDPOINT}/${bookmarkId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.API_KEY}`
      }
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        console.log(data);
        this.setState({
          id: data.id,
          title: data.title,
          url: data.url,
          description: data.description,
          rating: data.rating
        })
      })
      .catch(error => {
        this.setState({ error })
      })
  }

  handleSubmit = e => {
    e.preventDefault();
    const { bookmarkId } = this.props.match.params;
    const { id, title, url, description, rating } = this.state;
    const newBookmark = { title, url, description, rating };

    fetch(config.API_ENDPOINT + `/${bookmarkId}`, {
      method: 'PATCH',
      body: JSON.stringify(newBookmark),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.API_KEY}`
      }
    })
      .then(res => {
        if (!res.ok) {
          return new Error();
        }
      })
      .then(json => {
        this.context.editBookmark({...newBookmark, id: id});
      })
      .catch(e => e);
  }

  render() {
    return (
      <section className="EditBookmark">
        <h2>Edit bookmark</h2>
        <form className="EditBookmark__form" onSubmit={this.handleSubmit}>
          <div className="EditBookmark__error" role="alert">
            {this.state.error && <p>{this.state.error.message}</p>}
          </div>
          <input type="hidden" name="id" />
          <div>
            <label htmlFor="title">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              placeholder="Great website!"
              required
              value={this.state.title}
              onChange={this.handleChangeTitle}
            />
          </div>
          <div>
            <label htmlFor="url">
              URL
            </label>
            <input
              type="url"
              name="url"
              id="url"
              placeholder="https://www.great-website.com/"
              required
              value={this.state.url}
              onChange={this.handleChangeUrl}
            />
          </div>
          <div>
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              id="description"
              value={this.state.description}
              onChange={this.handleChangeDescription}
            />
          </div>
          <div>
            <label htmlFor="rating">
              Rating
            </label>
            <input
              type="number"
              name="rating"
              id="rating"
              min="1"
              max="5"
              required
              value={this.state.rating}
              onChange={this.handleChangeRating}
            />
          </div>
          <div className="EditBookmark__buttons">
            <button type="button" onClick={this.handleClickCancel}>
              Cancel
            </button>{" "}
            <button type="submit">Save</button>
          </div>
        </form>
      </section>
    );
  }
}

export default EditBookmark;