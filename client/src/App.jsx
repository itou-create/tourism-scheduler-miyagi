import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SearchPage from './pages/SearchPage';
import ResultPage from './pages/ResultPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
