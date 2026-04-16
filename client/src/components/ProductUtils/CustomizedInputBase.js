import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export default function CustomizedInputBase({ onSearch }) {
  const [inputValue, setInputValue] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    // Trigger search reset when input is cleared
    if (val.length === 0) {
      onSearch("");
    }
  };

  const handleClear = () => {
    setInputValue("");
    onSearch("");
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{ p: "4px 4px", display: "flex", alignItems: "center" }}
    >
      <IconButton sx={{ p: "10px" }} aria-label="menu">
        <MenuIcon />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search..."
        inputProps={{ "aria-label": "search products" }}
        value={inputValue}
        onChange={handleChange}
      />
      {inputValue && (
        <IconButton
          type="button"
          sx={{ p: "10px" }}
          aria-label="clear search"
          onClick={handleClear}
        >
          <ClearIcon />
        </IconButton>
      )}
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton
        type="submit"
        sx={{ p: "10px" }}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
