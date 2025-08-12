import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const SearchField = ({ label = "Search ...", setSearchString, namesList }) => {
  return (
    <Autocomplete
      onChange={(event, newValue) => setSearchString(newValue)}
      filterOptions={(options, params) =>
        options.filter((name) =>
          name.toLowerCase().includes(params.inputValue.toLowerCase())
        )
      }
      options={namesList}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option?.inputValue || ""
      }
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            {option}
          </li>
        );
      }}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};

export default SearchField;
