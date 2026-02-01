import { setTotalItems } from "./redux/appSlice";
export const getTotalAddedItems = async (userId) => {
    try {
    //   let userId = localStorage.getItem("userId");
      const response = await fetch(`http://localhost:5000/products/getAddedItems/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await response.json();
      return data.total_items ?? 0;
    } catch (error) {
      console.error("Error fetching total_items:", error);
      return 0;
    }
  };
  export const updateGlobalItemCount = async (userId, dispatch) => {
    const total = await getTotalAddedItems(userId);
    console.log("res", total);
    dispatch(setTotalItems(total));
  };