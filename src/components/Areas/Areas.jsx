import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Areas.css";
import { Carousel } from "react-responsive-carousel";
import 'react-responsive-carousel/lib/styles/carousel.min.css';

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    // Fetch days data from your API
    fetch("http://localhost:5000/api/areas")
      .then((response) => response.json())
      .then((data) => {
        setAreas(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching days:", error);
        setLoading(false);
      });
  }, []);
  const handlePageChange=(newPage)=>{
    setSelectedItem(newPage);
    setCurrentPage(newPage);
  }
  // Function to go to the previous page
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  // Function to go to the next page
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
    }
  };

 // Number of areas to display on each page
  const areasPerPage = 7;
  // Calculate the total number of pages
  const totalPages = Math.ceil(areas.length / areasPerPage);
    // Get the areas for the current page

  const areasForPage = areas.slice(currentPage * areasPerPage, (currentPage + 1)*areasPerPage)
  return (
    <div className="areas-body">
      <h2 className="areas-title">Distribution Areas</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (<>          
      <table className="areas-table">
        <thead>
          <tr>
            <th>Area</th>
          </tr>
        </thead>
        <tbody>
          {areasForPage.map((area) => (
            <tr key={area._id}>
              <td>
                <Link to={`/addresses/${area._id}`}>{area.name}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
            <div className="pagination">
              <div className="nav-arrow left" onClick={goToPreviousPage}>
                &lt;
              </div>
              <Carousel
                showStatus={false}
                showArrows={false}
                showThumbs={false}
                selectedItem={selectedItem}
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <div
                    key={i}
                    onClick={() => handlePageChange(i)}
                  >
                    Page {i + 1}
                  </div>
                ))}
              </Carousel>
              <div className="nav-arrow right" onClick={goToNextPage}>
                &gt;
              </div>
            </div>
          )}
      </>

      )}
    </div>
  );
}
