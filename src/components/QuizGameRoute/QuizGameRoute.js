import {useState, useEffect, useCallback} from 'react'
import {useHistory} from 'react-router-dom'
import './QuizGameRoute.css'

const QuizGameRoute = () => {
  const [questions, setQuestions] = useState([])
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [timer, setTimer] = useState(60) // 60 seconds timer
  const [selectedOption, setSelectedOption] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const history = useHistory()

  // Calculate percentage of correct answers
  const calculatePercentage = useCallback(() => {
    const correctAnswers = questions.filter(q => q.selectedOption?.isCorrect)
      .length
    return (correctAnswers / questions.length) * 100 // Return the percentage
  }, [questions])

  // Handle submit
  const handleSubmit = useCallback(() => {
    const percentage = calculatePercentage()

    if (percentage >= 60) {
      history.push('/results?status=won')
    } else {
      history.push('/results?status=lose')
    }
    setShowResults(true)
  }, [calculatePercentage, history])

  // Fetch questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('https://apis.ccbp.in/assess/questions')
        if (response.ok) {
          const data = await response.json()
          setQuestions(data.questions)
        } else {
          setError('Failed to fetch questions.')
        }
      } catch (err) {
        setError('Something went wrong. Please try again.')
      }
    }

    fetchQuestions()
  }, [])

  // Handle timer countdown
  useEffect(() => {
    let countdown
    if (questions.length > 0 && !showResults) {
      countdown = setInterval(() => {
        setTimer(prevTime => {
          if (prevTime <= 1) {
            clearInterval(countdown)
            handleSubmit() // Submit when timer ends
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }
    return () => clearInterval(countdown)
  }, [questions, showResults, handleSubmit]) // Include handleSubmit in dependency array

  // Handle option click
  const handleOptionClick = option => {
    setSelectedOption(option)
    setTimer(0) // Stop timer on option selection
    return option // Ensure the function returns a value
  }

  // Handle next question
  const handleNextQuestion = () => {
    setActiveQuestionIndex(prevIndex => prevIndex + 1)
    setSelectedOption(null)
    setTimer(60) // Reset timer for next question
  }

  if (error) {
    return (
      <div className="error-container">
        <img
          src="https://assets.ccbp.in/frontend/react-js/nxt-assess-failure-img.png"
          alt="failure view"
          className="failure-image"
        />
        <h1>Something went wrong</h1>
        <p>Our servers are busy, please try again</p>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="results-container">
        <p>Redirecting to results...</p>
      </div>
    )
  }

  const currentQuestion = questions[activeQuestionIndex] || {}

  return (
    <div className="quiz-game-container">
      <p>
        Question {activeQuestionIndex + 1}/{questions.length}
      </p>

      <p>Time Left: {timer}s</p>

      <p>{currentQuestion.question_text}</p>

      {currentQuestion.options && (
        <ul>
          {currentQuestion.options.map(option => (
            <li
              key={option.id}
              className={`
                ${selectedOption?.id === option.id ? 'selected-option' : ''}
              `}
            >
              {currentQuestion.options_type === 'DEFAULT' && (
                <>
                  <button
                    className={
                      option.isCorrect && selectedOption?.id === option.id
                        ? 'correct-option'
                        : ''
                    }
                    onClick={() => handleOptionClick(option)}
                    type="button" // Add type attribute
                  >
                    {option.text}
                  </button>
                  {selectedOption?.id === option.id && !option.isCorrect && (
                    <>
                      <img
                        src="https://assets.ccbp.in/frontend/react-js/quiz-game-close-circle-img.png"
                        alt="incorrect close circle"
                        className="status-icon"
                      />
                      {currentQuestion.options.find(o => o.isCorrect) && (
                        <img
                          src="https://assets.ccbp.in/frontend/react-js/quiz-game-check-circle-img.png"
                          alt="correct checked circle"
                          className="status-icon"
                        />
                      )}
                    </>
                  )}
                  {selectedOption?.id === option.id && option.isCorrect && (
                    <img
                      src="https://assets.ccbp.in/frontend/react-js/quiz-game-check-circle-img.png"
                      alt="correct checked circle"
                      className="status-icon"
                    />
                  )}
                </>
              )}
              {currentQuestion.options_type === 'IMAGE' && (
                <>
                  <img
                    src={option.image_url}
                    alt={option.text}
                    onClick={() => handleOptionClick(option)}
                    className={
                      selectedOption?.id === option.id ? 'selected-option' : ''
                    }
                  />
                  {selectedOption?.id === option.id && !option.isCorrect && (
                    <>
                      <img
                        src="https://assets.ccbp.in/frontend/react-js/quiz-game-close-circle-img.png"
                        alt="incorrect close circle"
                        className="status-icon"
                      />
                      {currentQuestion.options.find(o => o.isCorrect) && (
                        <img
                          src="https://assets.ccbp.in/frontend/react-js/quiz-game-check-circle-img.png"
                          alt="correct checked circle"
                          className="status-icon"
                        />
                      )}
                    </>
                  )}
                  {selectedOption?.id === option.id && option.isCorrect && (
                    <img
                      src="https://assets.ccbp.in/frontend/react-js/quiz-game-check-circle-img.png"
                      alt="correct checked circle"
                      className="status-icon"
                    />
                  )}
                </>
              )}
              {currentQuestion.options_type === 'SINGLE_SELECT' && (
                <>
                  <label>
                    <input
                      type="radio"
                      name="option"
                      value={option.id}
                      checked={selectedOption?.id === option.id}
                      onChange={() => handleOptionClick(option)}
                    />
                    {option.text}
                  </label>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {activeQuestionIndex < questions.length - 1 ? (
        <button type="button" onClick={handleNextQuestion}>
          Next Question
        </button> // Add type attribute
      ) : (
        <button type="button" onClick={handleSubmit}>
          Submit
        </button> // Add type attribute
      )}
    </div>
  )
}

export default QuizGameRoute
