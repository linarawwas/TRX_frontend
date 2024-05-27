import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Areas.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useSelector } from 'react-redux';
import AddArea from '../../components/Areas/AddArea/AddArea';
import SpinLoader from '../../components/UI reusables/SpinLoader/SpinLoader';

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
  const companyId: string = useSelector((state: any) => state.user.companyId);

  const handleFormToggle = () => {
    setFormVisible(!formVisible);
  };

  useEffect(() => {
    // Fetch areas data from your API
    fetch(`https://api.trx-bi.com/api/areas/company/${companyId}`, {
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
  }, [token, formVisible]);

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

  const areasPerPage: number = 4;
  const totalPages: number = Math.ceil(areas.length / areasPerPage);
  const areasForPage: Area[] = areas.slice(
    currentPage * areasPerPage,
    (currentPage + 1) * areasPerPage
  );

  return (
    <div className="areas-body">
      <div className="areas-header">
        <h2 className="areas-title">Distribution Areas</h2>
        <button onClick={handleFormToggle}>{formVisible ? "show areas" : "Add A new Area?"} </button>
      </div>

      {loading ? (
        <SpinLoader />
      ) : (
        <>
          <div className='areas-div'>{!formVisible && (
            areasForPage.map((area) => (
              <div key={area._id}>
                <Link to={`/addresses/${area._id}`} className='area-link'>{area.name}</Link>
              </div>
            ))
          )}
          </div>

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
