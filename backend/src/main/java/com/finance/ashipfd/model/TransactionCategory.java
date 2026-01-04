package com.finance.ashipfd.model;

public enum TransactionCategory {
    // Income Categories
    SALARY("Salary"),
    BUSINESS_INCOME("Business Income"),
    INVESTMENT_RETURNS("Investment Returns"),
    RENTAL_INCOME("Rental Income"),
    GIFTS_RECEIVED("Gifts Received"),
    TAX_REFUND("Tax Refund"),
    BONUS("Bonus"),
    SIDE_HUSTLE("Side Hustle"),
    OTHER_INCOME("Other Income"),

    // Expense Categories - Essential
    RENT_MORTGAGE("Rent/Mortgage"),
    UTILITIES("Utilities"),
    GROCERIES("Groceries"),
    TRANSPORTATION("Transportation"),
    GAS("Gas/Fuel"),
    INSURANCE("Insurance"),
    PHONE_INTERNET("Phone & Internet"),
    HEALTHCARE("Healthcare"),
    DEBT_PAYMENTS("Debt Payments"),

    // Expense Categories - Lifestyle
    DINING_OUT("Dining Out"),
    DELIVERY("Delivery"),
    ENTERTAINMENT("Entertainment"),
    SHOPPING("Shopping"),
    SUBSCRIPTIONS("Subscriptions"),
    GYM_FITNESS("Gym & Fitness"),
    TRAVEL("Travel"),
    HOBBIES("Hobbies"),
    PERSONAL_CARE("Personal Care"),
    GIFTS_GIVEN("Gifts Given"),

    // Expense Categories - Financial
    SAVINGS("Savings"),
    INVESTMENTS("Investments"),
    EMERGENCY_FUND("Emergency Fund"),
    RETIREMENT("Retirement"),
    TAXES("Taxes"),
    BANK_FEES("Bank Fees"),

    // Miscellaneous
    EDUCATION("Education"),
    CHARITY("Charity/Donations"),
    PET_EXPENSES("Pet Expenses"),
    HOME_IMPROVEMENT("Home Improvement"),
    CLOTHING("Clothing"),
    BOOKS_MEDIA("Books & Media"),
    OTHER_EXPENSE("Other Expense");

    private final String displayName;

    TransactionCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
