import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Article } from '../../../types/index';
import "../../../css/Loader.css";

const NewsPage = () => {
  const [forexNews, setForexNews] = useState<Article[]>([]);
  const [stocksNews, setStocksNews] = useState<Article[]>([]);
  const [commoditiesNews, setCommoditiesNews] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 4;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const [forexResponse, stocksResponse, commoditiesResponse] = await Promise.all([
          axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: 'forex',
              apiKey: '9ef608e634ce4927a83d8ac61d8918ad', // Replace with your NewsAPI key
            },
          }),
          axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: 'stocks',
              apiKey: '9ef608e634ce4927a83d8ac61d8918ad', // Replace with your NewsAPI key
            },
          }),
          axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: 'commodities',
              apiKey: '9ef608e634ce4927a83d8ac61d8918ad', // Replace with your NewsAPI key
            },
          }),
        ]);

        setForexNews(forexResponse.data.articles);
        setStocksNews(stocksResponse.data.articles);
        setCommoditiesNews(commoditiesResponse.data.articles);
        setIsLoading(false);
      } catch (error) {
        setError(error as Error);
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentForexArticles = forexNews.slice(indexOfFirstArticle, indexOfLastArticle);
  const currentStocksArticles = stocksNews.slice(indexOfFirstArticle, indexOfLastArticle);
  const currentCommoditiesArticles = commoditiesNews.slice(indexOfFirstArticle, indexOfLastArticle);

  const totalPages = Math.ceil(Math.max(forexNews.length, stocksNews.length, commoditiesNews.length) / articlesPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5;
    const halfMaxPageNumbers = Math.floor(maxPageNumbers / 2);

    let startPage = Math.max(currentPage - halfMaxPageNumbers, 1);
    let endPage = Math.min(startPage + maxPageNumbers - 1, totalPages);

    if (endPage - startPage < maxPageNumbers - 1) {
      startPage = Math.max(endPage - maxPageNumbers + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 px-3 py-1 rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className='loader'>
                <div className="loader-item"></div>
                <div className="loader-item"></div>
                <div className="loader-item"></div>
              </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error fetching news: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <div className="fixed top-0 left-0 right-0 bg-gray-900 text-white py-2 px-4 z-50">
        {/* <marquee behavior="scroll" direction="left">
          Latest Forex, Stocks, and Commodities News
        </marquee> */}
      </div>
      <div className="mt-12">
        <h1 className="text-white text-3xl font-bold mb-4">Global News</h1>
        <h2 className="text-white text-2xl font-bold mb-2">Forex News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {currentForexArticles.map((article, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-white mb-2">{article.title}</h2>
              <p className="text-gray-400 mb-4">{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Read more
              </a>
            </div>
          ))}
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Stocks News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {currentStocksArticles.map((article, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-white mb-2">{article.title}</h2>
              <p className="text-gray-400 mb-4">{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Read more
              </a>
            </div>
          ))}
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Commodities News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {currentCommoditiesArticles.map((article, index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-white mb-2">{article.title}</h2>
              <p className="text-gray-400 mb-4">{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Read more
              </a>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            className="mx-1 px-3 py-1 rounded bg-gray-700 text-gray-300"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            className="mx-1 px-3 py-1 rounded bg-gray-700 text-gray-300"
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;