import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { filtersAPI } from '../../lib/api';
import { FRANCE_REGIONS } from '../../lib/utils';

export const RaceFilters = ({ filters, onFiltersChange, onSearch }) => {
  const [regions, setRegions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  useEffect(() => {
    filtersAPI.getRegions().then(res => setRegions(res.data)).catch(() => setRegions(FRANCE_REGIONS));
  }, []);

  useEffect(() => {
    if (filters.region) {
      filtersAPI.getDepartments(filters.region).then(res => setDepartments(res.data)).catch(() => setDepartments([]));
    } else {
      setDepartments([]);
    }
  }, [filters.region]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchValue });
    onSearch?.();
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '' || value === null) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    if (key === 'region') {
      delete newFilters.department;
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).filter(k => filters[k] && k !== 'search').length;

  return (
    <div className="space-y-4" data-testid="race-filters">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher une course..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 h-12 bg-card border-border rounded-xl"
            data-testid="search-input"
          />
        </div>
        <Button type="submit" className="h-12 px-6 rounded-xl bg-primary text-primary-foreground" data-testid="search-btn">
          Rechercher
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`h-12 px-4 rounded-xl border-border ${showAdvanced ? 'bg-secondary' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
          data-testid="toggle-filters-btn"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </form>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="p-4 bg-card rounded-xl border border-border space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm uppercase tracking-wide text-muted-foreground">Filtres avancés</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground" data-testid="clear-filters-btn">
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Region */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Région</Label>
              <Select value={filters.region || 'all'} onValueChange={(v) => handleFilterChange('region', v)}>
                <SelectTrigger className="h-10 bg-background border-border rounded-lg" data-testid="region-select">
                  <SelectValue placeholder="Toutes les régions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les régions</SelectItem>
                  {regions.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Département</Label>
              <Select 
                value={filters.department || 'all'} 
                onValueChange={(v) => handleFilterChange('department', v)}
                disabled={!filters.region}
              >
                <SelectTrigger className="h-10 bg-background border-border rounded-lg" data-testid="department-select">
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les départements</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Distance</Label>
              <Select 
                value={filters.max_distance ? `${filters.min_distance || 0}-${filters.max_distance}` : 'all'} 
                onValueChange={(v) => {
                  if (v === 'all') {
                    handleFilterChange('min_distance', null);
                    handleFilterChange('max_distance', null);
                  } else {
                    const [min, max] = v.split('-').map(Number);
                    onFiltersChange({ ...filters, min_distance: min || undefined, max_distance: max || undefined });
                  }
                }}
              >
                <SelectTrigger className="h-10 bg-background border-border rounded-lg" data-testid="distance-select">
                  <SelectValue placeholder="Toutes distances" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes distances</SelectItem>
                  <SelectItem value="0-30">Court (&lt; 30 km)</SelectItem>
                  <SelectItem value="30-60">Moyen (30-60 km)</SelectItem>
                  <SelectItem value="60-100">Long (60-100 km)</SelectItem>
                  <SelectItem value="100-500">Ultra (&gt; 100 km)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Registration status */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Inscriptions</Label>
              <Select value={filters.registration_status || 'all'} onValueChange={(v) => handleFilterChange('registration_status', v)}>
                <SelectTrigger className="h-10 bg-background border-border rounded-lg" data-testid="status-select">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="open">Ouvertes</SelectItem>
                  <SelectItem value="not_open">À venir</SelectItem>
                  <SelectItem value="closed">Fermées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* UTMB toggle */}
          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="utmb-filter"
              checked={filters.is_utmb === true}
              onCheckedChange={(checked) => handleFilterChange('is_utmb', checked ? true : null)}
              data-testid="utmb-switch"
            />
            <Label htmlFor="utmb-filter" className="text-sm cursor-pointer">
              Courses UTMB uniquement
            </Label>
          </div>
        </div>
      )}
    </div>
  );
};
