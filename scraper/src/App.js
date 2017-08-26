import React, {Component} from 'react';
import './App.css';
const classNames = require('classnames');

class App extends Component {
    state = {
        articles: []
    };

    componentDidMount() {
        fetch('/scraper')
            .then(res => {
                return res.json();
            }).then(articles => {
            this.setState({articles: articles});
        });
    }

    render() {
        return (
            <div className="container">
                <h1>
                    Articles
                </h1>
                <ul>
                    {this.state.articles.map(article =>
                        <Article key={article._id} title={article.title} article={article}/>
                    )}
                </ul>
            </div>
        );
    }
}

class Article extends Component {
    constructor(props) {
        super(props);

        this.state = {
            article: this.props.article,
            guess: 'Is it The Onion?'
        };

        this.handler = this.handler.bind(this);
        this.handleGuess = this.handleGuess.bind(this);
        this.submitComment = this.submitComment.bind(this);
    }

    handler(article) {
        console.log(article);
        this.setState({
            article: article
        })
    }

    submitComment() {
        console.log(this.state.article._id, this.textInput.value);
        fetch(`/scraper/add/${this.state.article._id}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                comment: this.textInput.value
            })
        }).then(res => {
            return res.json();
        }).then(article => {
            this.setState({article: article});
            this.textInput.value = "";
        })
    }

    handleGuess(event) {
        fetch(`/scraper/check/${this.state.article._id}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                check: event.target.value
            })
        }).then(res => {
            return res.text()
        }).then(checked => {
            this.setState({guess: checked});
        })
    }

    render() {
        return (
            <li className="article">
                <h5>{this.state.article.title}</h5>
                <div className="isOnion">
                    <div className="guess">{this.state.guess}</div>
                    <button className={["button", "tick"].join(' ')} onClick={this.handleGuess} value="true">
                    </button>
                    <button className={["button", "cross"].join(' ')} onClick={this.handleGuess} value="false">
                    </button>
                </div>
                {this.state.article.comments.map(comment =>
                    <Comment handler={this.handler} key={comment._id} comment={comment}
                             articleID={this.state.article._id}/>
                )}
                <div>
                    <input className="addComment" ref={(input) => {
                        this.textInput = input
                    }}/>
                    <button onClick={this.submitComment}>
                        Add Comment
                    </button>
                </div>
            </li>
        )
    }
}

class Comment extends Component {
    constructor(props) {
        super(props);

        this.deleteComment = this.deleteComment.bind(this);
    }

    handleDelete(article) {
        this.props.handler(article);
    }

    deleteComment() {
        console.log(this.props);
        fetch(`/scraper/delete/${this.props.articleID}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                commentID: this.props.comment._id
            })
        }).then(res => {
            return res.json()
        }).then(deleted => {
            this.handleDelete(deleted);
        })
    }

    render() {
        return <div>
            <span>{this.props.comment.body}</span>
            <button onClick={this.deleteComment}>Delete</button>
        </div>
    }
}

export default App;
