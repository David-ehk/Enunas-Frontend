import React, { useState } from 'react';
import { Input } from "@/components/ui/input";

export function SearchBar() {
  // 1. Speichert den aktuellen Suchbegriff
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);
    
    // --- 2. HIER WIRD DIE QUERY AUSGELÖST ---
    if (newTerm.length > 2) {
      // Beispiel: Sende den Suchbegriff an eine API (Query)
      // fetch(`/api/products?q=${newTerm}`).then(...)
      
      // Oder filtere eine lokale Liste (Lokale Query)
      // const filteredResults = productList.filter(item => item.name.includes(newTerm));
    }
  };

  return (
    <Input
      type="search"
      placeholder="Search..."
      value={searchTerm}
      onChange={handleSearch} // Fängt die Eingabe ab und ruft die Funktion auf
    />
  );
}