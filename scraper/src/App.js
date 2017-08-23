import React, {Component} from 'react';
import './App.css';

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
            <div className="App">
                <h1>
                    Articles
                </h1>
                <ul>
                    {this.state.articles.map(article =>
                        <Article key={article.id} title={article.text}/>
                    )}
                </ul>
            </div>
        );
    }
}

class Article extends Component {
    render() {
        const {title} = this.props;
        return (
            <li className="article">
                {title}
            </li>
        )
    }
}

export default App;
