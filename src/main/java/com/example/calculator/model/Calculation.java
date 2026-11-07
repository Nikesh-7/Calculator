package com.example.calculator.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "calculations")
public class Calculation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double firstNumber;
    private double secondNumber;

    @Column(nullable = false, length = 16)
    private String operator;

    private double result;
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public double getFirstNumber() { return firstNumber; }
    public void setFirstNumber(double firstNumber) { this.firstNumber = firstNumber; }
    public double getSecondNumber() { return secondNumber; }
    public void setSecondNumber(double secondNumber) { this.secondNumber = secondNumber; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public double getResult() { return result; }
    public void setResult(double result) { this.result = result; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
