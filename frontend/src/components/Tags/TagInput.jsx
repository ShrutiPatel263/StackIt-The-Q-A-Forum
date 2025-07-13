import React, { useState, useEffect } from 'react'
import CreatableSelect from 'react-select/creatable'
import axios from 'axios'

const TagInput = ({ value = [], onChange, placeholder = "Add tags..." }) => {
  const [popularTags, setPopularTags] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPopularTags()
  }, [])

  const fetchPopularTags = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/users/tags/popular')
      setPopularTags(response.data.map(tag => ({
        value: tag.name,
        label: `${tag.name} (${tag.count})`
      })))
    } catch (error) {
      console.error('Fetch popular tags error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (selectedTags) => {
    const tags = selectedTags ? selectedTags.map(tag => tag.value) : []
    onChange(tags)
  }

  const currentValue = value.map(tag => ({ value: tag, label: tag }))

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '42px',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      '&:hover': {
        borderColor: '#3b82f6'
      },
      '&:focus-within': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#dbeafe',
      borderRadius: '1rem'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#1e40af',
      fontSize: '0.875rem',
      fontWeight: '500'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#1e40af',
      '&:hover': {
        backgroundColor: '#3b82f6',
        color: 'white'
      }
    })
  }

  return (
    <CreatableSelect
      isMulti
      value={currentValue}
      onChange={handleChange}
      options={popularTags}
      placeholder={placeholder}
      styles={customStyles}
      className="react-select-container"
      classNamePrefix="react-select"
      isLoading={loading}
      loadingMessage={() => "Loading tags..."}
      noOptionsMessage={() => "Type to create a new tag"}
      formatCreateLabel={(inputValue) => `Create tag: "${inputValue}"`}
    />
  )
}

export default TagInput