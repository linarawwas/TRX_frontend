import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Areas.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useSelector } from 'react-redux';
import AddArea from '../AddArea/AddArea';

interface Area {
  _id: string;
  name: string;
}

export default function Areas(): JSX.Element {
  const token: string = useSelector((state: any) => state.user.token);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [formVisible, setFormVisible] = useState<boolean>(false);

  const handleFormToggle = () => {
    setFormVisible(!formVisible);
  };

  useEffect(() => {
    // Fetch areas data from your API
    fetch('http://localhost:5000/api/areas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data: Area[]) => {
        setAreas(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching areas:', error);
        setLoading(false);
      });
  }, [token]);

  const handlePageChange = (newPage: number) => {
    setSelectedItem(newPage);
    setCurrentPage(newPage);
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1);
    }
  };

  const areasPerPage: number = 7;
  const totalPages: number = Math.ceil(areas.length / areasPerPage);
  const areasForPage: Area[] = areas.slice(
    currentPage * areasPerPage,
    (currentPage + 1) * areasPerPage
  );

  return (
    <div className="areas-body">
      <div className="areas-header">
        <h2 className="areas-title">Distribution Areas</h2>
        <button onClick={handleFormToggle}>Add A new Area? </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
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
                  <div key={i} onClick={() => handlePageChange(i)}>
                    Page {i + 1}
                  </div>
                ))}
              </Carousel>
              <div className="nav-arrow right" onClick={goToNextPage}>
                &gt;
              </div>
            </div>
          )}
          <div className="add-area-div">{formVisible && <AddArea />}</div>
        </>
      )}
    </div>
  );
}
